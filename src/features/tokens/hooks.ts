import { pricesCaller, selectors, totalSuppliesCaller } from "./slice";
import { useSelector } from "react-redux";
import useCallRegistrar from "hooks/use-call-registrar";
import type { AppState } from "features";
import type { RegisteredCall } from "helpers";

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

export function useTotalSuppliesRegistrar(
  tokenIds: string[],
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
  useCallRegistrar(
    {
      caller: totalSuppliesCaller,
      onChainCalls: createTotalSuppliesCalls(tokenIds),
    },
    actions,
    selectors
  );
}

export function usePricesRegistrar(
  tokenIds: string[],
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
  useCallRegistrar(
    {
      caller: pricesCaller,
      onChainCalls: [],
      offChainCalls: [
        {
          function: "retrieveCoingeckoDataForTokens",
          args: tokenIds,
        }
      ],
    },
    actions,
    selectors
  );

}