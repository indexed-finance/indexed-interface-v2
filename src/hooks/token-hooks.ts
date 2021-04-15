import { AppState, selectors, useSigner } from "features";
import { ApprovalStatus } from "features/user/slice";
import { Pair } from "@uniswap/sdk";
import { RegisteredCall, computeUniswapPairAddress, convert, getRandomEntries, sortTokens } from "helpers";
import { WETH_CONTRACT_ADDRESS } from "config";
import { approveSpender } from "ethereum";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTransactionNotification } from "./notification-hooks";
import { useUniswapPairs } from "./pair-hooks";

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
  approve: () => Promise<void>;
};

export function useTokenApproval({
  spender,
  tokenId,
  amount,
}: TokenApprovalOptions): TokenApprovalHook {
  const signer = useSigner();
  const { sendTransaction } = useTransactionNotification({
    successMessage: "TODO: Approve Succeed",
    errorMessage: "TODO: Approve Fail",
  });
  const status = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      spender.toLowerCase(),
      tokenId,
      amount
    )
  );
  const approve = useCallback(
    () =>
      signer && spender && status === "approval needed"
        ? sendTransaction(
            approveSpender(signer as any, spender, tokenId, amount)
          )
        : Promise.reject(),
    [signer, status, tokenId, spender, amount, sendTransaction]
  );

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

export function useTokenPrices(ids: string[]): [number[], false] | [undefined, true] {
  const tokens = useTokens(ids.map(id => id.toLowerCase()));

  usePricesRegistrar(ids);

  return useMemo(() => {
    const allPrices = tokens.map((token) => token?.priceData?.price);
    const loaded = !allPrices.some(p => !p);
    if (loaded) {
      return [allPrices as number[], false]
    }
    return [undefined, true]
  }, [tokens]);
}

const isToken0 = (pair: Pair, token: string) => pair.token0.address.toLowerCase() === token.toLowerCase()

const getLpTokenPrice = (pair: Pair, lpSupply: string, pricedToken: string, price: number) => {
  const totalSupply = parseFloat(convert.toBalance(convert.toBigNumber(lpSupply), 18, false));
  const halfReserves = isToken0(pair, pricedToken)
    ? pair.reserve0.toExact()
    : pair.reserve1.toExact();
  return (price * parseFloat(halfReserves) * 2) / totalSupply;
}

export const last = <T>(arr: T[]): T => arr[arr.length - 1];

type PricedAsset = {
  /**
   * @param id - ID of the token to look up the price for if
   * `useEthLpTokenPrice` is false, or the ID of the base token
   * if `useEthLpTokenPrice` is true.
   */
  id: string;
  /**
   * @param useEthLpTokenPrice - Boolean indicating whether to
   * query the price for the base token or the price of the LP
   * token for the base token's UNIV2 ETH pair.
   * If `true`, the resulting map will have the pair ID as the
   * key instead of the base token.
   * The reason we do it this way is to avoid a type-union here
   * where the caller might need to provide token0 and token1.
   */
  useEthLpTokenPrice: boolean;
};

export function useTokenPricesLookup(tokens: PricedAsset[]): Record<string, number> {
  const [baseTokenIds, pairTokens, pairTokenIds] = useMemo(() => {
    const baseTokenIds = [
      ...tokens.filter(t => !t.useEthLpTokenPrice).map(t => t.id),
      WETH_CONTRACT_ADDRESS
    ];
    const pairTokens = tokens.filter(t => t.useEthLpTokenPrice).map((token) => {
      const [token0, token1] = sortTokens(token.id, WETH_CONTRACT_ADDRESS);
      return {
        id: computeUniswapPairAddress(token0, token1).toLowerCase(),
        token0,
        token1,
        exists: undefined
      }
    });
    if (pairTokens.length) {
      baseTokenIds.push(WETH_CONTRACT_ADDRESS);
    }
    return [baseTokenIds, pairTokens, pairTokens.map(p => p.id)];
  }, [tokens]);
  const [baseTokenPrices, baseTokenPricesLoading] = useTokenPrices(baseTokenIds);
  // @todo only lookup supplies if we know the pair actually exists
  const [supplies, suppliesLoading] = useTotalSuppliesWithLoadingIndicator(
    pairTokenIds
  );
  const [pairs, pairsLoading] = useUniswapPairs(pairTokens);
  return useMemo(() => {
    const priceMap: Record<string, number> = {};
    if (!baseTokenPricesLoading) {
      for (const i in baseTokenIds) {
        priceMap[baseTokenIds[i]] = (baseTokenPrices as number[])[i];
      }
      if (pairTokens.length && !suppliesLoading && !pairsLoading) {
        for (const i in pairTokenIds) {
          const ethPrice = last(baseTokenPrices as number[])
          const id = pairTokenIds[i].toLowerCase();
          const supply = (supplies as string[])[i];
          // This might not be at the same index if any of the pairs don't exist
          const pair = (pairs as Pair[]).find(p => p.liquidityToken.address.toLowerCase() === id);
          if (pair) {
            priceMap[id] = getLpTokenPrice(pair, supply, WETH_CONTRACT_ADDRESS, ethPrice)
          }
        }
      }
    }
    return priceMap;
  }, [
    baseTokenIds, pairTokenIds, pairTokens,
    baseTokenPrices, baseTokenPricesLoading,
    supplies, suppliesLoading, pairs, pairsLoading
  ])
}

export const useEthPrice = () => useTokenPrice(WETH_CONTRACT_ADDRESS);

export function usePricesRegistrar(tokenIds: string[]) {
  useCallRegistrar({
    caller: TOKEN_PRICES_CALLER,
    onChainCalls: [],
    offChainCalls: [
      {
        target: "",
        function: "fetchTokenPriceData",
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
