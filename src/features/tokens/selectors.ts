import { EntityState } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { tokensAdapter } from "./slice";
import type { AppState } from "features/store";
import type { NormalizedToken } from "./types";

const selectors = tokensAdapter.getSelectors((state: AppState) => state.tokens);

const tokenSelectors = {
  ...selectors,
  selectTokens: (state: AppState): EntityState<NormalizedToken> => state.tokens,
  selectTokenById: (state: AppState, id: string) =>
    selectors.selectById(state, id.toLowerCase()),
  selectAllTokens: (state: AppState) => selectors.selectAll(state),
  selectTokenLookup: (state: AppState) => selectors.selectEntities(state),
  selectTokenSymbols: (state: AppState) =>
    selectors.selectAll(state).map(({ symbol }) => symbol),
  selectTokenSymbol: (state: AppState, poolId: string) =>
    tokenSelectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
  selectTokenPrice: (state: AppState, tokenId: string) =>
    tokenSelectors.selectTokenById(state, tokenId)?.priceData?.price,
  selectTokenLookupBySymbol: (state: AppState) => {
    const chainId = state.settings.network;
    const tokens = tokenSelectors.selectAllTokens(state).filter(t => t.chainId === chainId);

    return tokens.reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>);
  },
};


const selectTokensById: (state: AppState, ids: string[]) => (NormalizedToken | undefined)[] = createSelector(
  [tokenSelectors.selectTokens, (state: AppState, ids: string[]) => ids],
  (tokens, ids) => {
    return ids.reduce(
      (prev, next) => [...prev, tokens.entities[next.toLowerCase()]],
      [] as (NormalizedToken | undefined)[]
    );
  }
);

const selectTokenPrices: (state: AppState, tokenIds: string[]) => (number|undefined)[] = createSelector(
  [selectTokensById],
  (tokens) => tokens.map(t => t?.priceData?.price)
);

const selectTokenSupplies: (state: AppState, tokenIds: string[]) => (string|undefined)[] = createSelector(
  [selectTokensById],
  (tokens) => tokens
    .filter((each): each is NormalizedToken => Boolean(each))
    .map(({ totalSupply = "" }) => totalSupply)
);

export const tokensSelectors = {
  ...tokenSelectors,
  selectTokensById,
  selectTokenPrices,
  selectTokenSupplies,
}