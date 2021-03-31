import { pricesCaller, totalSuppliesCaller } from "./slice";
import { tokensSelectors } from "./selectors";
import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import type { AppState } from "features";
import type { RegisteredCall } from "helpers";

export const useToken = (tokenId: string) =>
  useSelector((state: AppState) =>
    tokensSelectors.selectTokenById(state, tokenId)
  );

export const useTokens = (tokenIds: string[]) =>
  useSelector((state: AppState) =>
    tokensSelectors.selectTokensById(state, tokenIds)
  );

export const useTokenLookupBySymbol = () =>
  useSelector(tokensSelectors.selectTokenLookupBySymbol);

export const useTokenLookup = () =>
  useSelector((state: AppState) => tokensSelectors.selectTokenLookup(state));

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
  tokensSelectors: Record<string, any>
) {
  useCallRegistrar(
    {
      caller: totalSuppliesCaller,
      onChainCalls: createTotalSuppliesCalls(tokenIds),
    },
    actions,
    tokensSelectors
  );
}

export function usePricesRegistrar(
  tokenIds: string[],
  actions: Record<string, any>,
  tokensSelectors: Record<string, any>
) {
  useCallRegistrar(
    {
      caller: pricesCaller,
      onChainCalls: [],
      offChainCalls: [
        {
          function: "retrieveCoingeckoDataForTokens",
          args: tokenIds,
        },
      ],
    },
    actions,
    tokensSelectors
  );
}
