import { AppState } from "features/store";
import { selectors } from "./slice";
import { useSelector } from "react-redux";

export const useToken = (tokenId: string) => useSelector(
  (state: AppState) => selectors.selectTokenById(state, tokenId)
);

export const useTokens = (tokenIds: string[]) => useSelector(
  (state: AppState) => selectors.selectTokensById(state, tokenIds)
);

export const useTokenLookupBySymbol = () => useSelector(
  (state: AppState) => selectors.selectTokenLookupBySymbol(state)
);

export const useTokenLookup = () => useSelector(
  (state: AppState) => selectors.selectTokenLookup(state)
);

