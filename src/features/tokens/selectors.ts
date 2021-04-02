import { tokensAdapter } from "./slice";
import type { AppState } from "features/store";
import type { NormalizedToken } from "ethereum";

const TWO_MINUTES = 1000 * 60 * 2;

export const tokensSelectors = {
  ...tokensAdapter.getSelectors((state: AppState) => state.tokens),
  selectTokens: (state: AppState) => state.tokens,
  selectTokenById: (state: AppState, id: string) =>
    tokensSelectors.selectById(state, id),
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
  selectAllTokens: (state: AppState) => tokensSelectors.selectAll(state),
  selectTokenLookup: (state: AppState) => tokensSelectors.selectEntities(state),
  selectTokenSymbols: (state: AppState) =>
    tokensSelectors.selectAll(state).map(({ symbol }) => symbol),
  selectTokenSymbol: (state: AppState, poolId: string) =>
    tokensSelectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
  selectTokenPrice: (state: AppState, tokenId: string) =>
    tokensSelectors.selectTokenById(state, tokenId)?.priceData?.price,
  selectTokenSupplies: (state: AppState, tokenIds: string[]) => {
    const lookup = tokensSelectors.selectTokensById(state, tokenIds);
    return lookup.map((t) => t?.totalSupply ?? "");
  },
  selectTokenLookupBySymbol: (state: AppState) => {
    const tokens = tokensSelectors.selectAllTokens(state);
    return tokens.reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>);
  },
  selectTokenStatsRequestable: (state: AppState) => {
    const now = Date.now();
    const { lastTokenStatsError: then } = tokensSelectors.selectTokens(state);

    return then === -1 || now - then >= TWO_MINUTES;
  },
};
