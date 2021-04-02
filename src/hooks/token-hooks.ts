import { AppState, actions, selectors } from "features";
import { ApprovalStatus } from "features/user/slice";
import { RegisteredCall, getRandomEntries } from "helpers";
import { WETH_CONTRACT_ADDRESS } from "config";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

// #region General
export const useToken = (tokenId: string) =>
  useSelector((state: AppState) => selectors.selectTokenById(state, tokenId));

export const useTokens = (tokenIds: string[]) =>
  useSelector((state: AppState) => selectors.selectTokensById(state, tokenIds));

export const useTokenLookup = () =>
  useSelector((state: AppState) => selectors.selectTokenLookup(state));

export const useTokenLookupBySymbol = () =>
  useSelector(selectors.selectTokenLookupBySymbol);

// #endregion

// #region Approval
interface TokenApprovalOptions {
  spender: string;
  tokenId: string;
  amount: string;
}

type TokenApprovalHook = {
  status: ApprovalStatus;
  approve: () => void;
};

export function useTokenApproval({
  spender,
  tokenId,
  amount,
}: TokenApprovalOptions): TokenApprovalHook {
  const dispatch = useDispatch();
  const status = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      spender.toLowerCase(),
      tokenId,
      amount
    )
  );
  const approve = useCallback(() => {
    if (spender && status === "approval needed") {
      dispatch(actions.approveSpender(spender, tokenId, amount));
    }
  }, [dispatch, status, tokenId, spender, amount]);

  return {
    status,
    approve,
  };
}
// #endregion

// #region Price
export const TOKEN_PRICES_CALLER = "Token Prices";

export function useTokenPrice(id: string): [number, false] | [undefined, true] {
  const token = useToken(id.toLowerCase());

  usePricesRegistrar([id]);

  if (token?.priceData?.price) {
    return [token.priceData.price, false];
  }

  return [undefined, true];
}

export const useEthPrice = () => useTokenPrice(WETH_CONTRACT_ADDRESS);

export function usePricesRegistrar(tokenIds: string[]) {
  useCallRegistrar({
    caller: TOKEN_PRICES_CALLER,
    onChainCalls: [],
    offChainCalls: [
      {
        target: "",
        function: "requestTokenStats",
        args: tokenIds,
        canBeMerged: true,
      },
    ],
  });
}
// #endregion

// #region Total Supplies
export const TOTAL_SUPPLIES_CALLER = "Total Supplies";

export function createTotalSuppliesCalls(tokenIds: string[]): RegisteredCall[] {
  return tokenIds.map((id) => ({
    caller: TOTAL_SUPPLIES_CALLER,
    interfaceKind: "IERC20_ABI",
    target: id,
    function: "totalSupply",
  }));
}

export function useTotalSuppliesRegistrar(tokenIds: string[]) {
  useCallRegistrar({
    caller: TOTAL_SUPPLIES_CALLER,
    onChainCalls: createTotalSuppliesCalls(tokenIds),
  });
}

export function useTotalSuppliesWithLoadingIndicator(
  tokens: string[]
): [string[], false] | [undefined, true] {
  const supplies = useSelector((state: AppState) =>
    selectors.selectTokenSupplies(state, tokens)
  );

  useTotalSuppliesRegistrar(tokens);

  return supplies.every(Boolean)
    ? [supplies as string[], false]
    : [undefined, true];
}
// #endregion

// #region Randomizer
type Asset = { name: string; symbol: string; id: string };

export type TokenRandomizerOptions = {
  assets: Asset[];
  from?: string;
  to: string;
  defaultInputSymbol?: string;
  defaultOutputSymbol?: string;
  changeFrom?(symbol: string): void;
  changeTo(symbol: string): void;
  callback?(): void;
};

export function useTokenRandomizer(options: TokenRandomizerOptions) {
  useEffect(() => {
    if (options.assets) {
      const { assets: tokens } = options;

      if (options.hasOwnProperty("from")) {
        if (!options.from && !options.to && tokens.length > 1) {
          const fromToken =
            options.defaultInputSymbol ?? getRandomEntries(1, tokens)[0].symbol;
          const toToken =
            options.defaultOutputSymbol ??
            getRandomEntries(
              1,
              tokens.filter((t) => t.symbol !== fromToken)
            )[0].symbol;

          if (options.changeFrom) {
            options.changeFrom(fromToken);
          }

          options.changeTo(toToken);

          if (options.callback) {
            options.callback();
          }
        }
      } else {
        if (!options.to && tokens.length > 0) {
          const [toToken] = getRandomEntries(1, tokens);

          options.changeTo(toToken.symbol);

          if (options.callback) {
            options.callback();
          }
        }
      }
    }
  }, [options]);
}
// #endregion
