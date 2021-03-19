import { DEFAULT_DECIMAL_COUNT } from "config";
import { NormalizedPool, PoolTokenUpdate } from "ethereum";
import { PoolUnderlyingToken } from "indexed-types";
import { categoriesSelectors } from "../categories";
import { convert } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import {
  poolTradesAndSwapsLoaded,
  poolUpdated,
  receivedInitialStateFromServer,
  receivedStatePatchFromServer,
  subgraphDataLoaded,
} from "features/actions";
import { tokensSelectors } from "features/tokens";
import S from "string";
import type { AppState } from "features/store";

export const adapter = createEntityAdapter<NormalizedPool>();

const slice = createSlice({
  name: "indexPools",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(subgraphDataLoaded, (state, action) => {
        const { pools } = action.payload;
        const fullPools = pools.ids.map((id) => pools.entities[id]);

        for (const { tokens } of fullPools) {
          for (const tokenId of tokens.ids) {
            const token = tokens.entities[tokenId];

            if (token.ready) {
              token.usedDenorm = token.denorm;
              token.usedBalance = token.balance;
            } else {
              token.usedDenorm = token.desiredDenorm;
              token.usedBalance = token.minimumBalance;
            }
          }
        }

        adapter.addMany(state, fullPools);
      })
      .addCase(poolUpdated, (state, action) => {
        const { pool, update } = action.payload;

        const poolInState = state.entities[pool.id];

        if (poolInState) {
          const { $blockNumber: _, tokens, ...rest } = update;
          const tokenEntities: Record<
            string,
            PoolTokenUpdate & PoolUnderlyingToken
          > = {};

          for (const token of tokens) {
            const { address, ...tokenUpdate } = token;
            const tokenInState = pool.tokens.entities[address];
            tokenEntities[address.toLowerCase()] = {
              ...tokenInState,
              ...tokenUpdate,
            };
          }

          state.entities[pool.id] = {
            ...poolInState,
            ...rest,
            tokens: {
              ids: poolInState.tokens.ids,
              entities: tokenEntities,
            },
          };
        }
      })
      .addCase(poolTradesAndSwapsLoaded, (state, action) => {
        const { poolId, trades, swaps } = action.payload;
        const poolInState = state.entities[poolId];

        if (poolInState) {
          poolInState.trades = trades ?? poolInState.trades;
          poolInState.swaps = swaps ?? poolInState.swaps;
        }
      })
      .addCase(receivedInitialStateFromServer, (_, action) => {
        const { indexPools } = action.payload;
        return indexPools;
      })
      .addCase(receivedStatePatchFromServer, (_, action) => {
        const { indexPools } = action.payload;

        return indexPools;
      }),
});

export const { actions } = slice;

export default slice.reducer;

// #region Helpers
function formatName(from: string) {
  return S(from).camelize().s.toLowerCase();
}
// #endregion
