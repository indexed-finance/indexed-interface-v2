import { NormalizedPool } from "ethereum";
import { convert } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import {
  poolTradesAndSwapsLoaded,
  poolUpdated,
  subgraphDataLoaded,
} from "features/actions";
import { tokensSelectors } from "features/models/tokens";
import type { AppState } from "features/store";

const adapter = createEntityAdapter<NormalizedPool>();

const slice = createSlice({
  name: "indexPools",
  initialState: adapter.getInitialState({
    active: "",
  }),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(subgraphDataLoaded, (state, action) => {
        const { pools } = action.payload;
        const fullPools = pools.ids.map((id) => pools.entities[id]);

        adapter.addMany(state, fullPools);
      })
      .addCase(poolUpdated, (state, action) => {
        const { pool, update } = action.payload;
        const poolInState = state.entities[pool.id];

        if (poolInState) {
          const { tokens: _, ...rest } = update;

          poolInState.dataFromUpdates = rest;
        }
      })
      .addCase(poolTradesAndSwapsLoaded, (state, action) => {
        const { poolId, trades, swaps } = action.payload;
        const poolInState = state.entities[poolId];

        if (poolInState) {
          if (!poolInState.dataForTradesAndSwaps) {
            poolInState.dataForTradesAndSwaps = {
              trades: [],
              swaps: [],
            };
          }

          poolInState.dataForTradesAndSwaps.trades = trades;
          poolInState.dataForTradesAndSwaps.swaps = swaps;
        }
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.indexPools),
  selectPool: (state: AppState, poolId: string) =>
    selectors.selectById(state, poolId),
  selectAllPools: (state: AppState) => selectors.selectAll(state),
  selectPoolTokenIds: (state: AppState, poolId: string) => {
    const pool = selectors.selectPool(state, poolId);
    return pool?.tokens ?? [];
  },
  selectPoolTokenSymbols: (state: AppState, poolId: string) => {
    const tokenIds = selectors.selectPoolTokenIds(state, poolId);
    const tokenLookup = tokensSelectors.selectEntities(state);
    const symbols = tokenIds.map((id) => tokenLookup[id]?.symbol ?? "");

    return symbols;
  },
  selectSwapFee: (state: AppState, poolId: string) => {
    const pool = selectors.selectPool(state, poolId);
    return pool ? convert.toBigNumber(pool.swapFee) : null;
  },
};

export default slice.reducer;
