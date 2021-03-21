import { selectors } from "features";
import { useSelector } from "react-redux";
import type { AppState } from "features";

export const useToken = (tokenId: string) =>
  useSelector((state: AppState) => selectors.selectTokenById(state, tokenId));

export const useTokens = (tokenIds: string[]) =>
  useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));

export const useTokenLookupBySymbol = () =>
  useSelector(selectors.selectTokenLookupBySymbol);

export const useTokenLookup = () =>
  useSelector((state: AppState) => selectors.selectTokenLookup(state));
