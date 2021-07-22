import { FEATURE_FLAGS } from "feature-flags";
import { RegisteredCall, debugConsole, deserializeOnChainCall } from "helpers";
import { actions, disconnectFromProvider, provider } from "./thunks";
import {
  fetchIndexPoolTransactions,
  fetchIndexPoolUpdates,
} from "./indexPools";
import { fetchInitialData } from "./requests";
import { fetchMulticallData } from "./batcher";
import { fetchTokenPriceData } from "./tokens";
import { selectors } from "./selectors";
import { userActions } from "./user";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import noop from "lodash.noop";
import type { AppState } from "./store";

export function userDisconnectionMiddleware() {
  return (next: any) => (action: any) => {
    if (action.type === userActions.userDisconnected.type) {
      disconnectFromProvider();
    }

    return next(action);
  };
}

export const actionHistory: any = [];
let isFirstBlockNumberChange = true;
let lastBlockTime = new Date().getTime();
export function trackActionMiddleware() {
  return (next: any) => (action: any) => {
    actionHistory.push(action.type);

    if (FEATURE_FLAGS.useActionLogging) {
      if (action.type === "batcher/blockNumberChanged") {
        if (isFirstBlockNumberChange) {
          isFirstBlockNumberChange = false;
        } else {
          const now = new Date().getTime();
          const duration = ((now - lastBlockTime) / 1000).toFixed(2);
          console.info(`REDUX) [---( Lasted ${duration} seconds. )---]\n`);
          lastBlockTime = now;
        }

        console.info(`REDUX) [---( BLOCK #: ${action.payload} )---]`);
      } else {
        console.info(`REDUX) ${action.type}`);
      }
    }

    return next(action);
  };
}

export function molassesModeMiddleware() {
  return (next: any) => (action: any) => {
    debugger;

    return next(action);
  };
}

// --
export const middleware = [userDisconnectionMiddleware, batchMiddleware];

if (process.env.NODE_ENV === "development" || process.env.IS_SERVER) {
  middleware.push(trackActionMiddleware);

  if (FEATURE_FLAGS.useMolassesMode) {
    middleware.push(molassesModeMiddleware);
  }
}

if (!process.env.IS_SERVER) {
  middleware.push(badNetworkMiddleware);
}

// #region Bad Network
export function badNetworkMiddleware({ dispatch, getState }: any) {
  return (next: any) => (action: any) => {
    const {
      settings: { badNetwork },
    } = getState();

    if (
      action.type !== actions.userDisconnected.type &&
      !badNetwork &&
      provider
    ) {
      provider.send("net_version", []).then((rawNetworkId) => {
        if (parseInt(rawNetworkId) !== 1) {
          dispatch(actions.connectedToBadNetwork());
        }
      });
    }

    return next(action);
  };
}
// #endregion

// #region Batch Stuff
let dispatch: any = noop;
let getState: any = noop;
let lastActiveOutdatedCalls: any = null;
let hasAttachedListener = false;
// const alreadyHandledBlockNumbers: any = {};

function handleBlockNumberChange(newBlockNumber: number) {
  if (typeof newBlockNumber === "number") {
    const state = getState();
    const currentBlockNumber = selectors.selectBlockNumber(state);

    if (newBlockNumber > currentBlockNumber) {
      lastActiveOutdatedCalls = [];
      dispatch(actions.blockNumberChanged(newBlockNumber));
      debouncedHandleBatchUpdate();
    }
  }
}

const debouncedHandleBlockNumberChange = debounce(handleBlockNumberChange, 100);

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

export function handleBatchUpdate() {
  const state = getState() as AppState;
  const activeOutdatedCalls = selectors.selectActiveOutdatedCalls(state);

  if (provider) {
    if (!hasAttachedListener) {
      // Manually request the first block number.
      provider
        .getBlockNumber()
        .then(debouncedHandleBlockNumberChange)
        .catch((error) =>
          debugConsole.error(`Failed to get block number`, error)
        );

      // Then, get automatic updates later.
      provider.on("block", debouncedHandleBlockNumberChange);

      // This only runs once.
      hasAttachedListener = true;
    }
  }

  if (!isEqual(activeOutdatedCalls, lastActiveOutdatedCalls)) {
    lastActiveOutdatedCalls = activeOutdatedCalls;

    if (provider) {
      // Now, fire any calls that were registered in between blocks.
      const { callers, onChainCalls, offChainCalls } = activeOutdatedCalls;

      if ([onChainCalls, offChainCalls].some(({ length }) => length > 0)) {
        debugConsole.log(
          `Preparing to execute ${onChainCalls.length} on-chain calls and ${offChainCalls.length} off-chain calls`
        );

        // Off-Chain
        dispatch(actions.fetchingOffChainCalls(offChainCalls));

        // On-Chain
        const normalizedOnChainCalls = normalizeCallBatch(onChainCalls);

        dispatch(
          fetchMulticallData({
            provider,
            arg: { onChainCalls: normalizedOnChainCalls, callers },
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

        setTimeout(() => {
          dispatch(actions.finishedFetchingOffChainCalls(offChainCalls));
        }, 2000);

        // Done.
        debugConsole.log(
          `Did execute ${onChainCalls.length} on-chain calls and ${offChainCalls.length} off-chain calls`
        );
      }
    }
  }
}

const debouncedHandleBatchUpdate = debounce(handleBatchUpdate, 2000);

export function batchMiddleware(storeApi: any) {
  return (next: any) => (action: any) => {
    dispatch = storeApi.dispatch;
    getState = storeApi.getState;

    debouncedHandleBatchUpdate();

    return next(action);
  };
}
// #endregion
