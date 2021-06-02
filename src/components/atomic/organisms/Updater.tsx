import { AppState } from "features/store";
import { RegisteredCall, deserializeOnChainCall } from "helpers";
import { actions, useProvider } from "features";
import { debugConsole } from "helpers/logger";

import {
  fetchIndexPoolTransactions,
  fetchIndexPoolUpdates,
  fetchInitialData,
  fetchMulticallData,
  fetchTokenPriceData,
  selectors,
} from "features";
import { useCachedValue, useDebounce } from "hooks/use-debounce";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function activeListeningKeys(
  listeners: AppState["batcher"]["listenerCounts"]
): string[] {
  if (!listeners) return [];

  return Object.keys(listeners).filter((callKey) => listeners[callKey] > 0);
}

function normalizeCallBatch(outdatedCallKeys: string[]) {
  return outdatedCallKeys.reduce(
    (prev, next) => {
      const [from] = next.split(": ");

      if (!prev.registrars.includes(from)) {
        prev.registrars.push(from);
        prev.callsByRegistrant[from] = [];
      }

      if (!prev.callsByRegistrant[from].includes(next)) {
        const deserialized = deserializeOnChainCall(next);

        if (deserialized) {
          prev.callsByRegistrant[from].push(next);
          prev.deserializedCalls.push(deserialized);
        }
      }

      return prev;
    },
    {
      registrars: [],
      callsByRegistrant: {},
      serializedCalls: outdatedCallKeys,
      deserializedCalls: [],
    } as {
      registrars: string[];
      callsByRegistrant: Record<string, string[]>;
      serializedCalls: string[];
      deserializedCalls: RegisteredCall[];
    }
  );
}

export function BatchUpdater() {
  const dispatch = useDispatch();
  const [provider] = useProvider();
  const activeOutdatedCalls = useSelector((state: AppState) =>
    selectors.selectActiveOutdatedCalls(state)
  );
  const debouncedCalls = useCachedValue(activeOutdatedCalls);

  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const debouncedBlockNumber = useDebounce(blockNumber, 100);
  const blockNumberCallback = useCallback(
    (newBlockNumber: number) => {
      if (typeof newBlockNumber !== "number") {
      } else if (newBlockNumber && newBlockNumber > (blockNumber || 0)) {
        setBlockNumber(newBlockNumber);
      }
    },
    [blockNumber, setBlockNumber]
  );

  useEffect(() => {
    if (!provider) {
      return undefined;
    }

    provider
      .getBlockNumber()
      .then((n) => blockNumberCallback(n))
      .catch((error) =>
        debugConsole.error(`Failed to get block number`, error)
      );

    provider.on("block", (n: number) => blockNumberCallback(n));
    return () => {
      if (provider) provider.removeListener("block", blockNumberCallback);
    };
  }, [dispatch, provider, blockNumberCallback, provider?.network?.name]);

  useEffect(() => {
    if (!debouncedBlockNumber) return;
    dispatch(actions.blockNumberChanged(debouncedBlockNumber));
  }, [debouncedBlockNumber, dispatch]);

  useEffect(() => {
    if (!provider) return undefined;
    const { callers, onChainCalls, offChainCalls } = debouncedCalls;
    if (onChainCalls.length === 0 && offChainCalls.length === 0) {
      return;
    }
    debugConsole.log(
      `Preparing to execute ${onChainCalls.length} on-chain calls and ${offChainCalls.length} off-chain calls`
    );
    dispatch(actions.fetchingOffChainCalls(offChainCalls));

    const _batch = normalizeCallBatch(onChainCalls);
    dispatch(
      fetchMulticallData({
        provider,
        arg: { onChainCalls: _batch, callers },
      })
    );
    for (const call of offChainCalls) {
      const [fn, args] = call.split("/");
      const request = {
        fetchInitialData,
        fetchIndexPoolTransactions,
        fetchIndexPoolUpdates,
        fetchTokenPriceData,
      }[fn] as any;

      if (request) {
        dispatch(
          request({
            provider,
            arg: [...args.split("_")],
          })
        );
      }
    }
    debugConsole.log(
      `Did execute ${onChainCalls.length} on-chain calls and ${offChainCalls.length} off-chain calls`
    );
  }, [dispatch, debouncedCalls, provider]);

  return null;
}
