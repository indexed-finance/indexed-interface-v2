import { AppState } from "features/store";
import { RegisteredCall, deserializeOnChainCall } from "helpers";
import { actions, useProvider, useSigner } from "features";
import { debugConsole } from "helpers/logger";
import { fetchIndexPoolTransactions, fetchIndexPoolUpdates } from "./indexPools";
import { fetchInitialData } from "./requests";
import { fetchMulticallData, normalizeMulticallData } from "./batcher/requests";
import { fetchTokenPriceData } from "./tokens";
import { multicall } from "ethereum";
import { selectors } from "./selectors";
import { useCachedValue, useDebounce } from "hooks/use-debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function activeListeningKeys(
  listeners: AppState['batcher']['listenerCounts'],
): string[] {
  if (!listeners) return [];

  return Object.keys(listeners).filter((callKey) => listeners[callKey] > 0)
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

export function BlockUpdater() {
  const dispatch = useDispatch();
  const [provider,] = useProvider();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const debouncedBlockNumber = useDebounce(blockNumber, 100);

  const blockNumberCallback = useCallback(
    (newBlockNumber: number) => {
      setBlockNumber(oldBlockNumber => {
        if (typeof newBlockNumber !== 'number') return oldBlockNumber;
        debugConsole.log(`Got block number! ${newBlockNumber}`)
        return Math.max(newBlockNumber, (oldBlockNumber || 0))
      })
    },
    [setBlockNumber]
  );

  useEffect(() => {
    if (!provider) return undefined

    provider
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch(error => debugConsole.error(`Failed to get block number`, error))

    provider.on('block', blockNumberCallback)
    return () => {
      provider.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, provider, blockNumberCallback])

  useEffect(() => {
    if (!debouncedBlockNumber) return
    dispatch(actions.blockNumberChanged(debouncedBlockNumber))
  }, [debouncedBlockNumber, dispatch]);

  return null;
}

export function BatchUpdater() {
  const dispatch = useDispatch();
  const [provider,] = useProvider();
  const activeOutdatedCalls = useSelector((state: AppState) => selectors.selectActiveOutdatedCalls(state));
  const debouncedCalls = useCachedValue(activeOutdatedCalls);

  useEffect(() => {
    if (!provider) return undefined;
    const {
      callers,
      onChainCalls,
      offChainCalls
    } = debouncedCalls;
    if (
      onChainCalls.length === 0 &&
      offChainCalls.length === 0
    ) {
      return;
    }
    debugConsole.log(`Preparing to execute ${onChainCalls.length} on-chain calls and ${offChainCalls.length} off-chain calls`)
    dispatch(actions.fetchingOffChainCalls(offChainCalls));

    const _batch = normalizeCallBatch(onChainCalls);
    dispatch(fetchMulticallData({
      provider,
      arg: { onChainCalls: _batch, callers }
    }))
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
    debugConsole.log(`Did execute ${onChainCalls.length} on-chain calls and ${offChainCalls.length} off-chain calls`)
  }, [dispatch, debouncedCalls, provider]);
  
  return null;
}