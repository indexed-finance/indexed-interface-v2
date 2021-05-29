import {
  CallRegistration,
  RegisteredCall,
  dedupe,
  deserializeOnChainCall,
  serializeOffChainCall,
  serializeOnChainCall,
} from "helpers";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { debugConsole } from "helpers/logger";
import { fetchMulticallData } from "./requests";
import { mirroredServerState, restartedDueToError } from "../actions";
import { settingsActions } from "../settings";
import { userActions } from "../user";
import type { AppState } from "../store";
import type { SelectedBatch } from "./types";

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

      state.onChainCalls = dedupe(state.onChainCalls);
      state.offChainCalls = dedupe(state.offChainCalls);
    },
    callsRegistered(
      state,
      action: PayloadAction<CallRegistration | CallRegistration[]>
    ) {
      const values = [action.payload].flat();

      for (const callRegistration of values) {
        const { caller, onChainCalls, offChainCalls } = callRegistration;
        debugConsole.log(`REGISTER :: ${caller} : Registering ${onChainCalls.length} on-chain calls for ${caller}`)

        const existingEntry = state.callers[caller];
        const callerEntry = {
          onChainCalls: existingEntry?.onChainCalls ?? [],
          offChainCalls: existingEntry?.offChainCalls ?? [],
        };

        for (const call of onChainCalls) {
          const callId = serializeOnChainCall(call);

          if (!state.onChainCalls.includes(callId)) {
            state.onChainCalls.push(callId);
          }

          callerEntry.onChainCalls.push(callId);

          state.listenerCounts[callId] =
            (state.listenerCounts[callId] ?? 0) + 1;
        }

        for (const call of offChainCalls) {
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
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }>
    ) {
      const { onChainCalls, offChainCalls } = action.payload;

      for (const call of onChainCalls) {
        const callId = serializeOnChainCall(call);

        state.listenerCounts[callId]--;
      }

      for (const call of offChainCalls) {
        const callId = serializeOffChainCall(call);

        state.listenerCounts[callId]--;
      }
    },
  },
  extraReducers: (builder) =>
    builder
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
        state.blockNumber = action.payload.blockNumber;
      })
      .addCase(mirroredServerState, (state, action) => {
        state.blockNumber = action.payload.batcher.blockNumber;
      })
      .addCase(restartedDueToError, () => batcherInitialState)
      // Caching data from on- and off-chain calls.
      .addMatcher(
        (action) =>
          [
            // Put these in manually to avoid a circular dependency.
            "newStaking/fetch/fulfilled",
            "staking/fetch/fulfilled",
            "indexPools/fetch/fulfilled",
            "indexPools/fetchTransactions/fulfilled",
            "indexPools/fetchUpdates/fulfilled",
            "batcher/multicall/fulfilled",
            "tokens/fetchPriceData/fulfilled",
          ].includes(action.type),
        (state, action) => {
          const potentialArgs = Object.keys(action.payload).join("_");
          const callLookup = {
            "staking/fetch/fulfilled": "fetchStakingData",
            "indexPools/fetch/fulfilled": `fetchIndexPools/${potentialArgs}`,
            "indexPools/fetchUpdates/fulfilled": `fetchIndexPoolUpdates/${potentialArgs}`,
            "indexPools/fetchTransactions/fulfilled": `fetchIndexPoolTransactions/${potentialArgs}`,
            "batcher/multicall/fulfilled": "fetchMulticallData",
            "tokens/fetchPriceData/fulfilled": `getTokenPriceData/${potentialArgs}`,
            "newStaking/fetch/fulfilled": "fetchNewStakingData",
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
      )
      // Losing connection.
      .addMatcher(
        (action) => [settingsActions.connectionLost.type].includes(action.type),
        (state, action) => {
          if (action.type === settingsActions.connectionLost.type) {
            state.status = "idle";
          }
        }
      )
      // Resetting when connecting to server or disconnecting wallet.
      .addMatcher(
        (action) =>
          [
            userActions.userDisconnected.type,
            settingsActions.connectionEstablished.type,
          ].includes(action.type),
        (state) => {
          state.onChainCalls = [];
          state.offChainCalls = [];
          state.listenerCounts = {};
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
      fetching
    } = state.batcher;
    function mergeOffChainCalls() {
      const { toMerge, toKeep } = offChainCalls
      .filter(k => listenerCounts[k] > 0)
      .reduce(
        (prev, next) => {
          const [call, args, canBeMerged] = next.split("/");
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
    const activeAndOutdated = (k: string) => {
      const outdated = !cache[k] || cache[k].fromBlockNumber < blockNumber;
      return listenerCounts[k] > 0 && outdated && !fetching[k];
    };
    return {
      callers,
      onChainCalls: onChainCalls.filter(k => activeAndOutdated(k)),
      offChainCalls: mergeOffChainCalls()
        .filter(k => !fetching[k])
        .filter(k => !cache[k] || cache[k].fromBlockNumber < blockNumber)
    }
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
    return Object.keys(state.batcher.fetching).filter(k => state.batcher.fetching[k]).length;
  },
  selectCacheEntry(state: AppState, callId: string) {
    const { blockNumber, cache } = state.batcher;
    const entry = cache[callId];

    return entry && blockNumber - entry.fromBlockNumber <= MAX_AGE_IN_BLOCKS
      ? entry
      : null;
  },
};
