import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  RegisteredCall,
  deserializeOnChainCall,
  serializeOffChainCall,
  serializeOnChainCall,
} from "helpers";
import {
  fetchMulticallData,
  fetchPoolTradesSwaps,
  fetchStakingData,
  fetchTokenStats,
} from "../requests";
import { restartedDueToError } from "../actions";
import { settingsActions } from "../settings";
import { userActions } from "../user";
import type { AppState } from "../store";

const MAX_AGE_IN_BLOCKS = 4; // How old can data be in the cache?

interface BatcherState {
  blockNumber: number;
  onChainCalls: string[];
  offChainCalls: string[];
  callers: Record<
    string,
    {
      onChainCalls: string[];
      offChainCalls: string[];
    }
  >;
  listenerCounts: Record<string, number>;
  cache: Record<
    string,
    {
      result: string[];
      fromBlockNumber: number;
    }
  >;
  status: "idle" | "loading" | "deferring to server";
}

const batcherInitialState: BatcherState = {
  blockNumber: -1,
  onChainCalls: [],
  offChainCalls: [],
  callers: {},
  cache: {},
  listenerCounts: {},
  status: "idle",
} as BatcherState;

const slice = createSlice({
  name: "batcher",
  initialState: batcherInitialState,
  reducers: {
    blockNumberChanged(state, action: PayloadAction<number>) {
      const blockNumber = action.payload;

      if (blockNumber > 0) {
        state.blockNumber = blockNumber;
      }
    },
    registrantRegistered(
      state,
      action: PayloadAction<{
        caller: string;
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }>
    ) {
      const { caller, onChainCalls, offChainCalls } = action.payload;
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

        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }

      for (const call of offChainCalls) {
        const callId = serializeOffChainCall(call);

        if (!state.offChainCalls.includes(callId)) {
          state.offChainCalls.push(callId);
        }

        callerEntry.offChainCalls.push(callId);

        state.listenerCounts[callId] = (state.listenerCounts[callId] ?? 0) + 1;
      }

      state.callers[caller] = callerEntry;
    },
    registrantUnregistered(
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
      .addCase(fetchMulticallData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(settingsActions.connectionEstablished, (state) => {
        state.status = "deferring to server";
      })
      .addCase(fetchMulticallData.fulfilled, (state) => {
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
      })
      .addCase(restartedDueToError, () => batcherInitialState)
      // Caching data from on- and off-chain calls.
      .addMatcher(
        (action) =>
          [
            fetchMulticallData.fulfilled.type,
            fetchTokenStats.fulfilled.type,
            fetchPoolTradesSwaps.fulfilled.type,
            fetchStakingData.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          const callLookup = {
            [fetchTokenStats.fulfilled.type]: "fetchTokenStats",
            [fetchPoolTradesSwaps.fulfilled.type]: "fetchPoolTradesSwaps",
            [fetchStakingData.fulfilled.type]: "fetchStakingData",
            [fetchMulticallData.fulfilled.type]: "fetchMulticallData",
          };
          const call = callLookup[action.type];

          if (action.type === fetchMulticallData.fulfilled.type) {
            const { callsToResults } = action.payload as {
              callsToResults: Record<string, string[]>;
            };

            for (const [call, result] of Object.entries(callsToResults)) {
              state.cache[call] = {
                result,
                fromBlockNumber: state.blockNumber,
              };
            }
          } else {
            state.cache[call] = {
              result: action.payload as any,
              fromBlockNumber: state.blockNumber,
            };
          }
        }
      )
      // Losing connection.
      .addMatcher(
        (action) =>
          [
            settingsActions.connectionLost.type,
            settingsActions.connectionToggled.type,
          ].includes(action.type),
        (state, action) => {
          if (
            action.type === settingsActions.connectionLost.type ||
            (action.type === settingsActions.connectionToggled.type &&
              state.status === "deferring to server")
          ) {
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
  selectBatch(state: AppState): SelectedBatch {
    return {
      callers: state.batcher.callers,
      onChainCalls: batcherSelectors.selectOnChainBatch(state),
      offChainCalls: batcherSelectors.selectOffChainBatch(state),
    };
  },
  selectOnChainBatch(state: AppState) {
    const { onChainCalls } = state.batcher;
    const cachedCalls = batcherSelectors.selectCachedCallsFromCurrentBlock(
      state
    );

    return onChainCalls
      .filter((call) => !cachedCalls[call])
      .reduce(
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
          serializedCalls: onChainCalls,
          deserializedCalls: [],
        } as {
          registrars: string[];
          callsByRegistrant: Record<string, string[]>;
          serializedCalls: string[];
          deserializedCalls: RegisteredCall[];
        }
      );
  },
  selectOffChainBatch(state: AppState) {
    const { offChainCalls } = state.batcher;
    const cachedCalls = batcherSelectors.selectCachedCallsFromCurrentBlock(
      state
    );
    const { toMerge, toKeep } = offChainCalls
      .filter((call) => !cachedCalls[call])
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
          toMerge: {},
          toKeep: [],
        } as {
          toMerge: Record<string, string[]>;
          toKeep: string[];
        }
      );
    const merged = Object.entries(toMerge).map(
      ([key, value]) => `${key}/${value.join("_")}`
    );

    return [...toKeep, ...merged];
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
  selectCacheEntry(state: AppState, callId: string) {
    const { blockNumber, cache } = state.batcher;
    const entry = cache[callId];

    return entry && blockNumber - entry.fromBlockNumber <= MAX_AGE_IN_BLOCKS
      ? entry
      : null;
  },
  selectCachedCallsFromCurrentBlock(state: AppState) {
    const blockNumber = batcherSelectors.selectBlockNumber(state);
    const calls = Object.keys(state.batcher.cache);

    return calls.reduce((prev, next) => {
      const entry = batcherSelectors.selectCacheEntry(state, next);
      prev[next] = Boolean(entry && entry.fromBlockNumber === blockNumber);
      return prev;
    }, {} as Record<string, boolean>);
  },
};

export type SelectedBatch = {
  callers: Record<string, { onChainCalls: string[]; offChainCalls: string[] }>;
  onChainCalls: {
    registrars: string[];
    callsByRegistrant: Record<string, string[]>;
    serializedCalls: string[];
    deserializedCalls: RegisteredCall[];
  };
  offChainCalls: string[];
};
