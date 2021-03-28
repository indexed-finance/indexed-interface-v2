import { adapter } from "./slice";
import type { AppState } from "features/store";
import type { NormalizedToken } from "ethereum";

const selectors = {
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
  selectTokenSymbols: (state: AppState) =>
    selectors.selectAll(state).map(({ symbol }) => symbol),
  selectTokenSymbol: (state: AppState, poolId: string) =>
    selectors.selectTokenLookup(state)[poolId]?.symbol ?? "",
  selectTokenPrice: (state: AppState, tokenId: string) =>
    selectors.selectTokenById(state, tokenId)?.priceData?.price,
  selectTokenSupplies: (state: AppState, tokenIds: string[]) => {
    const lookup = selectors.selectTokensById(state, tokenIds);
    return lookup.map((t) => t?.totalSupply ?? "");
  },
  selectTokenLookupBySymbol: (state: AppState) => {
    const tokens = selectors.selectAllTokens(state);
    return tokens.reduce((prev, next) => {
      prev[next.symbol.toLowerCase()] = next;
      return prev;
    }, {} as Record<string, NormalizedToken>);
  },
};

export default selectors;
