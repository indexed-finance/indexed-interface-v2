import {
  MulticallData,
  cachedMulticallDataReceived,
  coingeckoDataLoaded,
  multicallDataReceived,
  poolTradesAndSwapsLoaded,
} from "features/actions";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { actions as stakingActions } from "../staking/slice";
import type { AppState } from "features/store";

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

const MAX_AGE_IN_BLOCKS = 4; // How old can data be in the cache?

const slice = createSlice({
  name: "cache",
  initialState: {
    blockNumber: 0,
    entries: {},
  } as CacheState,
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
      .addCase(coingeckoDataLoaded, (state, action) => {
        const formattedCall = `retrieveCoingeckoData/${
          action.payload.pool ?? Object.keys(action.payload.tokens).join("_")
        }`;

        state.entries[formattedCall] = {
          result: action.payload as any,
          fromBlockNumber: state.blockNumber,
        };
      })
      .addCase(poolTradesAndSwapsLoaded, (state, action) => {
        const { poolId } = action.payload;
        const formattedCall = `requestPoolTradesAndSwaps/${poolId}`;

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
      .addMatcher(
        (action) =>
          [
            multicallDataReceived.type,
            cachedMulticallDataReceived.type,
          ].includes(action.type),
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

export const { actions } = slice;

export const selectors = {
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
      ? entry.result
      : null;
  },
};

export default slice.reducer;