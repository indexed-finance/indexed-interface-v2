import { COMMON_BASE_TOKENS } from "config";
import { NormalizedToken } from "ethereum";
import {
  coingeckoDataLoaded,
  coingeckoIdsLoaded,
  multicallDataReceived,
  receivedInitialStateFromServer,
  receivedStatePatchFromServer,
  subgraphDataLoaded,
  totalSuppliesUpdated,
  uniswapPairsRegistered,
} from "features/actions";
import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { createMulticallDataParser } from "helpers";
import type { AppState } from "features/store";

export const TOTAL_SUPPLIES_CALLER = "Total Supplies";

const adapter = createEntityAdapter<NormalizedToken>();

const slice = createSlice({
  name: "tokens",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(multicallDataReceived, (state, action) => {
        const relevantMulticallData = totalSuppliesMulticallDataParser(
          action.payload
        );

        if (relevantMulticallData) {
          for (const [tokenAddress, result] of Object.entries(
            relevantMulticallData
          )) {
            const entry = state.entities[tokenAddress];

            if (entry) {
              entry.totalSupply = result;
            }
          }
        }

        return state;
      })
      .addCase(subgraphDataLoaded, (state, action) => {
        const { tokens } = action.payload;
        const fullTokens = tokens.ids.map((id) => tokens.entities[id]);

        for (const commonToken of COMMON_BASE_TOKENS) {
          if (!tokens.entities[commonToken.id]) {
            fullTokens.push({ ...commonToken, coingeckoId: "" });
          }
        }

        adapter.addMany(state, fullTokens);
      })
      .addCase(coingeckoIdsLoaded, (state, action) => {
        const symbolToIdLookup = action.payload.reduce((prev, next) => {
          prev[next.symbol.toLowerCase()] = next.id;
          return prev;
        }, {} as Record<string, string>);

        for (const id of state.ids) {
          const token = state.entities[id];

          if (token) {
            token.coingeckoId = symbolToIdLookup[token.symbol];
          }
        }
      })
      .addCase(coingeckoDataLoaded, (state, action) => {
        for (const [
          address,
          { price, change24Hours, percentChange24Hours },
        ] of Object.entries(action.payload.tokens)) {
          const entry = state.entities[address.toLowerCase()];

          if (entry) {
            entry.priceData = {
              price,
              change24Hours,
              percentChange24Hours,
            };
          }
        }
      })
      .addCase(receivedInitialStateFromServer, (_, action) => {
        const { tokens } = action.payload;

        return tokens;
      })
      .addCase(receivedStatePatchFromServer, (_, action) => {
        const { tokens } = action.payload;

        return tokens;
      })
      .addCase(totalSuppliesUpdated, (state, action) => {
        for (const { token, totalSupply } of action.payload) {
          const entity = state.entities[token.toLowerCase()];
          if (entity) {
            entity.totalSupply = totalSupply;
          }
        }
      })
      .addCase(uniswapPairsRegistered, (state, action) => {
        for (const pair of action.payload) {
          if (!state.entities[pair.id.toLowerCase()]) {
            state.entities[pair.id.toLowerCase()] = {
              id: pair.id.toLowerCase(),
              symbol: "UniV2",
              name: `UniswapV2 LP Token`,
              decimals: 18,
              coingeckoId: "",
            };
          }
        }
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.tokens),
  selectTokens: (state: AppState) => state.tokens,
  selectTokenById: (state: AppState, id: string) =>
    selectors.selectById(state, id),
  selectTokensById: (
    state: AppState,
    ids: string[]
  ): (NormalizedToken | undefined)[] => {
    const tokens = selectors.selectTokens(state);
    return ids.reduce(
      (prev, next) => [...prev, tokens.entities[next.toLowerCase()]],
      [] as (NormalizedToken | undefined)[]
    );
  },
  selectAllTokens: (state: AppState) => selectors.selectAll(state),
  selectTokenLookup: (state: AppState) => selectors.selectEntities(state),
  selectTokenLookupBySymbol: (
    state: AppState
  ): Record<string, NormalizedToken> => ({}),
  selectTokenSymbols: (state: AppState) =>
    selectors.selectAll(state).map(({ symbol }) => symbol),
  selectTokenSymbol: (state: AppState, poolId: string) =>
    selectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
};

export const selectTokenSupplies = createSelector(
  selectors.selectTokensById,
  (tokens) => tokens.map((t: NormalizedToken | undefined) => t?.totalSupply)
);

selectors.selectTokenLookupBySymbol = createSelector(
  selectors.selectAllTokens,
  (tokens) =>
    tokens.reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>)
);

export default slice.reducer;

// #region Helpers
const totalSuppliesMulticallDataParser = createMulticallDataParser(
  TOTAL_SUPPLIES_CALLER,
  (calls) => {
    const formattedTotalSupplies = calls.reduce((prev, next) => {
      const [tokenAddress, functions] = next;
      const totalSupplies = functions.totalSupply;

      for (const totalSupply of totalSupplies) {
        if (totalSupply.result) {
          prev[tokenAddress] = totalSupply.result[0];
        }
      }

      return prev;
    }, {} as Record<string, string>);

    return formattedTotalSupplies;
  }
);

// #endregion
