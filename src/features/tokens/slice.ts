import { NormalizedToken } from "ethereum";
import {
  coingeckoDataLoaded,
  coingeckoIdsLoaded,
  receivedInitialStateFromServer,
  receivedStatePatchFromServer,
  subgraphDataLoaded,
} from "features/actions";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { AppState } from "features/store";

const adapter = createEntityAdapter<NormalizedToken>();

const slice = createSlice({
  name: "tokens",
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(subgraphDataLoaded, (state, action) => {
        const { tokens } = action.payload;
        const fullTokens = tokens.ids.map((id) => tokens.entities[id]);

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
        ] of Object.entries(action.payload)) {
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
      }),
});

export const { actions } = slice;

export const selectors = {
  ...adapter.getSelectors((state: AppState) => state.tokens),
  selectTokens: (state: AppState) => state.tokens,
  selectAllTokens: (state: AppState) => selectors.selectAll(state),
  selectTokenLookup: (state: AppState) => selectors.selectEntities(state),
  selectTokenLookupBySymbol: (state: AppState) =>
    selectors.selectAllTokens(state).reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>),
  selectTokenSymbols: (state: AppState) =>
    selectors.selectAll(state).map(({ symbol }) => symbol),

  selectTokenSymbol: (state: AppState, poolId: string) =>
    selectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
};

export default slice.reducer;
