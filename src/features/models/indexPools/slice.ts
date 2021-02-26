import { FormInstance } from "antd";
import { NormalizedPool } from "ethereum";
import { convert } from "helpers";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import {
  poolTradesAndSwapsLoaded,
  poolUpdated,
  poolUserDataLoaded,
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
      })
      .addCase(poolUserDataLoaded, (state, action) => {
        const { poolId, userData } = action.payload;
        const poolInState = state.entities[poolId];

        if (poolInState) {
          poolInState.dataForUser = userData;
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
    return pool ? convert.toBigNumber(pool.swapFee).times(1e18) : null;
  },
  selectPoolInitializerAddress: (state: AppState, poolId: string) => {
    const pool = selectors.selectPool(state, poolId);
    return pool?.poolInitializer?.id ?? null;
  },
  selectPoolUserData: (state: AppState, poolId: string) => {
    const pool = selectors.selectPool(state, poolId);
    return pool?.dataForUser ?? null;
  },
  selectApprovalStatus: (
    state: AppState,
    poolId: string,
    tokenSymbol: string,
    amount: string
  ) => {
    const userData = selectors.selectPoolUserData(state, poolId);

    if (userData && tokenSymbol) {
      const tokenLookup = tokensSelectors.selectTokenLookupBySymbol(state);
      const { id: tokenAddress } = tokenLookup[tokenSymbol];
      const tokenData = userData[tokenAddress];

      if (tokenData) {
        const { allowance } = tokenData;
        const needsApproval = convert
          .toBigNumber(amount)
          .isGreaterThan(convert.toBigNumber(allowance));

        return needsApproval;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  selectRelevantBalances: (
    state: AppState,
    poolId: string,
    form: FormInstance<any>,
    provider?: null | ethers.providers.Web3Provider
  ) => {
    const pool = selectors.selectPool(state, poolId);
    const tokenLookup = tokensSelectors.selectTokenLookupBySymbol(state);
    const emptyBalance = {
      from: "0.00",
      to: "0.00",
    };

    if (provider && pool) {
      const userData = selectors.selectPoolUserData(state, poolId);

      if (userData) {
        const {
          from: { token: inputToken },
          to: { token: outputToken },
        } = form.getFieldsValue();

        if (inputToken && outputToken) {
          const { id: inputTokenAddress } = tokenLookup[
            inputToken.toLowerCase()
          ];
          const { id: outputTokenAddress } = tokenLookup[
            outputToken.toLowerCase()
          ];
          const { balance: fromBalance } = userData[inputTokenAddress];
          const { balance: toBalance } = userData[outputTokenAddress];

          return {
            from: convert.toBalance(fromBalance),
            to: convert.toBalance(toBalance),
          };
        } else {
          return emptyBalance;
        }
      } else {
        return emptyBalance;
      }
    } else {
      return emptyBalance;
    }
  },
};

export default slice.reducer;
