import {
  MulticallData,
  fetchMulticallData,
} from "../requests/multicall-request";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  poolTradesAndSwapsLoaded,
  restartedDueToError,
  tokenStatsDataLoaded,
} from "../actions";
import { stakingActions } from "../staking";
import type { AppState } from "../store";

interface CacheState {
  blockNumber: number;
  entries: Record<
    string,
    {
      result: string[];
      fromBlockNumber: number;
    }
  >;
}

const initialState: CacheState = {
  blockNumber: -1,
  entries: {},
};

const MAX_AGE_IN_BLOCKS = 4; // How old can data be in the cache?

const slice = createSlice({
  name: "cache",
  initialState,
  reducers: {
    blockNumberChanged(state, action: PayloadAction<number>) {
      const blockNumber = action.payload;

      if (blockNumber > 0) {
        state.blockNumber = blockNumber;
      }
    },
    cachePurged(state) {
      const { blockNumber } = state;

      if (blockNumber > 0) {
        for (const [key, { fromBlockNumber }] of Object.entries(
          state.entries
        )) {
          if (blockNumber - fromBlockNumber > MAX_AGE_IN_BLOCKS) {
            delete state.entries[key];
          }
        }
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(tokenStatsDataLoaded, (state, action) => {
        const formattedCall = `requestTokenStats/${Object.keys(
          action.payload
        ).join("_")}`;

        state.entries[formattedCall] = {
          result: action.payload as any,
          fromBlockNumber: state.blockNumber,
        };
      })
      .addCase(poolTradesAndSwapsLoaded, (state, action) => {
        const formattedCall = `requestPoolTradesAndSwaps/${Object.keys(
          action.payload
        ).join("_")}`;

        state.entries[formattedCall] = {
          result: action.payload as any,
          fromBlockNumber: state.blockNumber,
        };

        return state;
      })
      .addCase(stakingActions.stakingDataLoaded, (state, action) => {
        const formattedCall = "requestStakingData";

        state.entries[formattedCall] = {
          result: action.payload as any,
          fromBlockNumber: state.blockNumber,
        };

        return state;
      })
      .addCase(restartedDueToError, () => initialState)
      .addCase(
        fetchMulticallData.fulfilled,
        (state, action: PayloadAction<MulticallData>) => {
          const { callsToResults } = action.payload;

          for (const [call, result] of Object.entries(callsToResults)) {
            state.entries[call] = {
              result,
              fromBlockNumber: state.blockNumber,
            };
          }
        }
      ),
});

export const { actions: cacheActions, reducer: cacheReducer } = slice;

export const cacheSelectors = {
  selectBlockNumber(state: AppState) {
    return state.cache.blockNumber;
  },
  selectCacheSize(state: AppState) {
    return Object.keys(state.cache.entries).length;
  },
  selectCacheEntry(state: AppState, callId: string) {
    const { blockNumber, entries } = state.cache;
    const entry = entries[callId];

    return entry && blockNumber - entry.fromBlockNumber <= MAX_AGE_IN_BLOCKS
      ? entry
      : null;
  },
  selectCachedCallsFromCurrentBlock(state: AppState) {
    const blockNumber = cacheSelectors.selectBlockNumber(state);
    const calls = Object.keys(state.cache.entries);

    return calls.reduce((prev, next) => {
      const entry = cacheSelectors.selectCacheEntry(state, next);
      prev[next] = Boolean(entry && entry.fromBlockNumber === blockNumber);
      return prev;
    }, {} as Record<string, boolean>);
  },
};
