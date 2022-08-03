import {
  CallRegistration,
  RegisteredCall,
  serializeOffChainCall,
  serializeOnChainCall,
} from "helpers";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { debugConsole } from "helpers/logger";
import { fetchMulticallData } from "./requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import { transactionFinalized } from "../transactions/actions";
import type { AppState } from "../store";

const MAX_AGE_IN_BLOCKS = 4; // How old can data be in the cache?

interface BatcherState {
  blockNumber: number;
  onChainCalls: string[];
  offChainCalls: string[];
  listenerCounts: Record<string, number>;
  fetching: Record<string, boolean>;
  callers: Record<
    string,
    {
      onChainCalls: string[];
      offChainCalls: string[];
    }
  >;
  cache: Record<
    string,
    {
      result: string[];
      fromBlockNumber: number;
    }
  >;
  status: "idle" | "loading";
}

const batcherInitialState: BatcherState = {
  blockNumber: -1,
  onChainCalls: [],
  offChainCalls: [],
  callers: {},
  cache: {},
  listenerCounts: {},
  fetching: {},
  status: "idle",
};

const slice = createSlice({
  name: "batcher",
  initialState: batcherInitialState,
  reducers: {
    fetchingOffChainCalls(state, action: PayloadAction<string[]>) {
      for (const key of action.payload) {
        state.fetching[key] = true;
      }
    },
    finishedFetchingOffChainCalls(state, action: PayloadAction<string[]>) {
      for (const key of action.payload) {
        state.fetching[key] = false;
      }
    },
    blockNumberChanged(state, action: PayloadAction<number>) {
      const blockNumber = action.payload;

      if (blockNumber > 0) {
        state.blockNumber = blockNumber;
      }
    },
    callsRegistered(
      state,
      action: PayloadAction<CallRegistration | CallRegistration[]>
    ) {
      const values = [action.payload].flat();

      for (const callRegistration of values) {
        const { caller, onChainCalls, offChainCalls, chainId } =
          callRegistration;
        debugConsole.log(
          `REGISTER :: ${caller} : Registering ${onChainCalls.length} on-chain and ${offChainCalls.length} off-chain calls for ${caller}`
        );

        const existingEntry = state.callers[caller];
        const callerEntry = {
          onChainCalls: existingEntry?.onChainCalls ?? [],
          offChainCalls: existingEntry?.offChainCalls ?? [],
        };

        for (const _call of onChainCalls) {
          const call = { ..._call };
          if (!call.chainId) call.chainId = chainId;
          const callId = serializeOnChainCall(call);

          if (!state.onChainCalls.includes(callId)) {
            state.onChainCalls.push(callId);
          }

          callerEntry.onChainCalls.push(callId);

          state.listenerCounts[callId] =
            (state.listenerCounts[callId] ?? 0) + 1;
        }

        for (const _call of offChainCalls) {
          const call = { ..._call };
          if (!call.chainId) call.chainId = chainId;
          const callId = serializeOffChainCall(call);

          if (!state.offChainCalls.includes(callId)) {
            state.offChainCalls.push(callId);
          }

          callerEntry.offChainCalls.push(callId);

          state.listenerCounts[callId] =
            (state.listenerCounts[callId] ?? 0) + 1;
        }

        state.callers[caller] = callerEntry;
      }
    },
    callsUnregistered(
      state,
      action: PayloadAction<{
        caller: string;
        chainId: number;
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }>
    ) {
      const { onChainCalls, offChainCalls, chainId } = action.payload;

      for (const _call of onChainCalls) {
        const call = { ..._call };
        if (!call.chainId) call.chainId = chainId;
        const callId = serializeOnChainCall(call);

        state.listenerCounts[callId]--;
      }

      for (const _call of offChainCalls) {
        const call = { ..._call };
        if (!call.chainId) call.chainId = chainId;
        const callId = serializeOffChainCall(call);

        state.listenerCounts[callId]--;
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(transactionFinalized, (state, action) => {
        const { blockNumber } = action.payload.receipt;
        if (blockNumber > state.blockNumber) {
          state.blockNumber = blockNumber;
        }
      })
      .addCase(fetchMulticallData.pending, (state, action) => {
        state.status = "loading";
        const onChainCalls = action.meta.arg.arg.onChainCalls.serializedCalls;
        for (const key of onChainCalls) {
          state.fetching[key] = true;
        }
      })
      .addCase(fetchMulticallData.fulfilled, (state, action) => {
        const oldCalls: Record<string, true> = {};

        for (const [call, value] of Object.entries(state.listenerCounts)) {
          if (value === 0) {
            oldCalls[call] = true;
            delete state.listenerCounts[call];
          }
        }

        state.onChainCalls = state.onChainCalls.filter(
          (call) => !oldCalls[call]
        );

        state.offChainCalls = state.offChainCalls.filter(
          (call) => !oldCalls[call]
        );

        state.status = "idle";
        state.blockNumber = action.payload.blockNumber ?? state.blockNumber;
      })
      .addCase(mirroredServerState, (state, action) => {
        state.blockNumber = action.payload.batcher.blockNumber;
      })
      .addCase(restartedDueToError, () => batcherInitialState)
      // .addCase(changedNetwork, () => batcherInitialState)
      // Caching data from on- and off-chain calls.
      .addMatcher(
        (action) =>
          [
            // Put these in manually to avoid a circular dependency.
            "indexPools/fetch/fulfilled",
            "indexPools/fetchUpdates/fulfilled",
            "indexPools/fetchTransactions/fulfilled",
            "batcher/multicall/fulfilled",
            "tokens/fetchPriceData/fulfilled",
          ].includes(action.type),
        (state, action) => {
          if (action.payload) {
            const potentialArgs = Object.keys(action.payload).join("_");
            const callLookup = {
              "indexPools/fetch/fulfilled": `fetchIndexPools/${potentialArgs}`,
              "indexPools/fetchUpdates/fulfilled": `fetchIndexPoolUpdates/${potentialArgs}`,
              "indexPools/fetchTransactions/fulfilled": `fetchIndexPoolTransactions/${potentialArgs}`,
              "batcher/multicall/fulfilled": "fetchMulticallData",
              "tokens/fetchPriceData/fulfilled": `getTokenPriceData/${potentialArgs}`,
            };
            const call = callLookup[action.type as keyof typeof callLookup];

            if (action.type === fetchMulticallData.fulfilled.type) {
              const { callsToResults } = action.payload as {
                callsToResults: Record<string, string[]>;
              };

              for (const [key, value] of Object.entries(callsToResults)) {
                state.cache[key] = {
                  result: value,
                  fromBlockNumber: state.blockNumber,
                };
                state.fetching[key] = false;
              }
            } else {
              state.cache[call] = {
                result: action.payload as any,
                fromBlockNumber: state.blockNumber,
              };
              state.fetching[call] = false;
            }
          }
        }
      ),
});

export const { actions: batcherActions, reducer: batcherReducer } = slice;

export const batcherSelectors = {
  selectBlockNumber(state: AppState) {
    return state.batcher.blockNumber;
  },
  selectActiveOutdatedCalls(state: AppState) {
    const {
      onChainCalls,
      blockNumber,
      cache,
      offChainCalls,
      callers,
      listenerCounts,
      fetching,
    } = state.batcher;
    const stateChainId = state.settings.network;
    function mergeOffChainCalls() {
      const { toMerge, toKeep } = offChainCalls
        .filter((k) => listenerCounts[k] > 0)
        .reduce(
          (prev, next) => {
            const [chainId, call, args, canBeMerged] = next.split("/");
            if (canBeMerged) {
              if (!prev.toMerge[call]) {
                prev.toMerge[call] = [];
              }
              prev.toMerge[call].push(args);
            } else {
              prev.toKeep.push(next);
            }
            return prev;
          },
          {
            toMerge: {} as Record<string, string[]>,
            toKeep: [] as string[],
          }
        );
      const merged = Object.entries(toMerge).map(
        ([key, value]) => `${key}/${value.join("_")}`
      );

      return [...toKeep, ...merged];
    }
    const keysForThisChain = onChainCalls.filter(
      (c) => +c.split("/")[0] === stateChainId
    ).length;
    console.log(
      `# OnChain Calls: ${onChainCalls.length} | # For Chain: ${keysForThisChain}`
    );
    const activeAndOutdated = (k: string) => {
      const [chainId] = k.split("/");
      const outdated = !cache[k] || cache[k].fromBlockNumber < blockNumber;
      return (
        listenerCounts[k] > 0 &&
        outdated &&
        !fetching[k] &&
        stateChainId === +chainId
      );
    };
    return {
      callers,
      onChainCalls: onChainCalls.filter((k) => activeAndOutdated(k)),
      offChainCalls: mergeOffChainCalls()
        .filter((k) => !fetching[k])
        .filter((k) => !cache[k] || cache[k].fromBlockNumber < blockNumber),
    };
  },
  selectBatcherStatus(state: AppState) {
    const { status, onChainCalls, offChainCalls } = state.batcher;

    return {
      status,
      onChainCalls: onChainCalls.length,
      offChainCalls: offChainCalls.length,
    };
  },
  selectCacheSize(state: AppState) {
    return Object.keys(state.batcher.cache).length;
  },
  selectFetchingCount(state: AppState) {
    return Object.keys(state.batcher.fetching).filter(
      (k) => state.batcher.fetching[k]
    ).length;
  },
  selectCacheEntry(state: AppState, callId: string) {
    const { blockNumber, cache } = state.batcher;
    const entry = cache[callId];

    return entry && blockNumber - entry.fromBlockNumber <= MAX_AGE_IN_BLOCKS
      ? entry
      : null;
  },
};
