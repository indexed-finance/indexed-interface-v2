import { RegisteredCall, selectors } from "features";
import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import type { AppState } from "features";

export const totalSuppliesCaller = "Total Supplies";

export const useToken = (tokenId: string) =>
  useSelector((state: AppState) => selectors.selectTokenById(state, tokenId));

export const useTokens = (tokenIds: string[]) =>
  useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));

export const useTokenLookupBySymbol = () =>
  useSelector(selectors.selectTokenLookupBySymbol);

export const useTokenLookup = () =>
  useSelector((state: AppState) => selectors.selectTokenLookup(state));

export function createTotalSuppliesCalls(tokenIds: string[]): RegisteredCall[] {
  return tokenIds.map((id) => ({
    caller: totalSuppliesCaller,
    interfaceKind: "IERC20_ABI",
    target: id,
    function: "totalSupply",
  }));
}

export function useTotalSuppliesRegistrar(tokenIds: string[]) {
  useCallRegistrar({
    caller: totalSuppliesCaller,
    onChainCalls: createTotalSuppliesCalls(tokenIds),
  });
}
