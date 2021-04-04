import { tokensAdapter } from "./slice";
import type { AppState } from "features/store";
import type { NormalizedToken } from "./types";

const selectors = tokensAdapter.getSelectors((state: AppState) => state.tokens);

export const tokensSelectors = {
  selectTokens: (state: AppState) => state.tokens,
  selectTokenById: (state: AppState, id: string) =>
    selectors.selectById(state, id),
  selectTokensById: (
    state: AppState,
    ids: string[]
  ): (NormalizedToken | undefined)[] => {
    const tokens = tokensSelectors.selectTokens(state);

    return ids.reduce(
      (prev, next) => [...prev, tokens.entities[next.toLowerCase()]],
      [] as (NormalizedToken | undefined)[]
    );
  },
  selectAllTokens: (state: AppState) => selectors.selectAll(state),
  selectTokenLookup: (state: AppState) => selectors.selectEntities(state),
  selectTokenSymbols: (state: AppState) =>
    selectors.selectAll(state).map(({ symbol }) => symbol),
  selectTokenSymbol: (state: AppState, poolId: string) =>
    tokensSelectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
  selectTokenPrice: (state: AppState, tokenId: string) =>
    tokensSelectors.selectTokenById(state, tokenId)?.priceData?.price,
  selectTokenSupplies: (state: AppState, tokenIds: string[]) => {
    const lookup = tokensSelectors.selectTokensById(state, tokenIds);

    return lookup
      .filter((each): each is NormalizedToken => Boolean(each))
      .map(({ totalSupply = "" }) => totalSupply);
  },
  selectTokenLookupBySymbol: (state: AppState) => {
    const tokens = tokensSelectors.selectAllTokens(state);

    return tokens.reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>);
  },
};
