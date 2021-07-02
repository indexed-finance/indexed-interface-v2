import { actions, selectors } from "features";
import {
  bestTradeExactIn,
  bestTradeExactOut,
  buildCommonTokenPairs,
  computeSushiswapPairAddress,
  computeUniswapPairAddress,
  convert,
  sortTokens,
} from "helpers";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import type { AppState, FormattedPair, NormalizedToken } from "features";
import type {
  BestTradeOptions,
  Pair,
  Token,
  TokenAmount,
  Trade,
} from "@indexed-finance/narwhal-sdk";
import type { RegisteredCall } from "helpers";

export const PAIR_DATA_CALLER = "Pair Data";

export type RegisteredPair = {
  id: string;
  token0: string;
  token1: string;
  exists?: boolean;
};

export const usePair = (pairId: string) =>
  useSelector((state: AppState) => selectors.selectPairById(state, pairId));

export const usePairExistsLookup = (
  pairIds: string[]
): Record<string, boolean> =>
  useSelector((state: AppState) =>
    selectors.selectPairExistsLookup(state, pairIds)
  );

export function createPairDataCalls(pairs: RegisteredPair[]): RegisteredCall[] {
  return pairs.map((pair) => ({
    caller: PAIR_DATA_CALLER,
    interfaceKind: "Pair",
    target: pair.id,
    function: "getReserves",
  }));
}

export function usePairDataRegistrar(pairs: RegisteredPair[]) {
  useCallRegistrar({
    caller: PAIR_DATA_CALLER,
    onChainCalls: createPairDataCalls(pairs),
  });
}

// #region Uniswap
type PairToken = {
  id: string;
  exists: boolean | undefined;
  token0: string;
  token1: string;
  sushiswap?: boolean;
};

export function buildUniswapPairs(baseTokens: string[]) {
  const tokenPairs = buildCommonTokenPairs(baseTokens);
  const pairs: PairToken[] = tokenPairs.reduce((arr, [tokenA, tokenB]) => {
    const [token0, token1] = sortTokens(tokenA, tokenB);

    return [
      ...arr,
      {
        id: computeUniswapPairAddress(token0, token1),
        exists: undefined,
        token0,
        token1,
        sushiswap: false,
      },
      {
        id: computeSushiswapPairAddress(token0, token1),
        exists: undefined,
        token0,
        token1,
        sushiswap: true,
      },
    ];
  }, [] as PairToken[]);

  return pairs;
}

export function useUniswapPairs(
  pairs: PairToken[]
): [Pair[], false] | [undefined, true] {
  const dispatch = useDispatch();
  const pairDatas = useSelector((state: AppState) =>
    selectors.selectFormattedPairsById(
      state,
      pairs.map(({ id }) => id)
    )
  );

  useEffect(() => {
    dispatch(actions.uniswapPairsRegistered(pairs));
  }, [dispatch, pairs]);

  usePairDataRegistrar(pairs);

  const isLoading = useMemo(() => {
    return pairDatas.some((p) => !p || typeof p.exists === "undefined");
  }, [pairDatas]);

  return useMemo(() => {
    try {
      if (!isLoading) {
        const goodPairs = (pairDatas as FormattedPair[]).filter(
          ({ exists }) => exists
        );
        const uniSdkPairs = goodPairs.map((entry) =>
          convert.toUniswapSDKPair({ network: { chainId: 1 } }, entry)
        ) as Pair[];

        return [uniSdkPairs, false];
      } else {
        return [undefined, true];
      }
    } catch (error) {
      return [undefined, true];
    }
  }, [pairDatas, isLoading]);
}

export function useCommonUniswapPairs(
  baseTokens: string[]
): [Pair[], false] | [undefined, true] {
  const pairs = useMemo(() => buildUniswapPairs(baseTokens), [baseTokens]);
  return useUniswapPairs(pairs);
}

export function useUniswapTradingPairs(baseTokens: string[]) {
  const [pairs, loading] = useCommonUniswapPairs(baseTokens);
  const calculateBestTradeForExactInput = useCallback(
    (
      tokenIn: NormalizedToken,
      tokenOut: NormalizedToken,
      amountIn: BigNumber,
      opts?: BestTradeOptions
    ): Trade | undefined => {
      if (!loading) {
        const [bestTrade] = bestTradeExactIn(
          pairs as Pair[],
          convert.toUniswapSDKCurrencyAmount(
            { network: { chainId: 1 } },
            tokenIn,
            amountIn,
            18
          ) as TokenAmount,
          convert.toUniswapSDKCurrency(
            { network: { chainId: 1 } },
            tokenOut
          ) as Token,
          opts ?? { maxHops: 3, maxNumResults: 1 }
        );
        return bestTrade;
      }
    },
    [loading, pairs]
  );
  const calculateBestTradeForExactOutput = useCallback(
    (
      tokenIn: NormalizedToken,
      tokenOut: NormalizedToken,
      amountOut: BigNumber,
      opts?: BestTradeOptions
    ): Trade | undefined => {
      if (!loading) {
        const [bestTrade] = bestTradeExactOut(
          pairs as Pair[],
          convert.toUniswapSDKCurrency(
            { network: { chainId: 1 } },
            tokenIn
          ) as Token,
          convert.toUniswapSDKCurrencyAmount(
            { network: { chainId: 1 } },
            tokenOut,
            amountOut,
            18
          ) as TokenAmount,
          opts ?? { maxHops: 3, maxNumResults: 1 }
        );

        return bestTrade;
      }
    },
    [loading, pairs]
  );

  return {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
    loading,
  };
}
// #endregion
