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
import { useChainId } from "./settings-hooks";
import { useDispatch, useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import type { AppState, FormattedPair, NormalizedToken } from "features";
import type {
  BestTradeOptions,
  ChainId,
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

export function buildUniswapPairs(baseTokens: string[], chainId: number) {
  const tokenPairs = buildCommonTokenPairs(baseTokens, chainId);
  const pairs: PairToken[] = tokenPairs.reduce((arr, [tokenA, tokenB]) => {
    const [token0, token1] = sortTokens(tokenA, tokenB);

    return [
      ...arr,
      {
        id: computeUniswapPairAddress(token0, token1, chainId),
        exists: undefined,
        token0,
        token1,
        sushiswap: false,
      },
      {
        id: computeSushiswapPairAddress(token0, token1, chainId),
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
  const chainId = useChainId()
  const pairDatas = useSelector((state: AppState) =>
    selectors.selectFormattedPairsById(
      state,
      pairs.map(({ id }) => id)
    )
  );

  useEffect(() => {
    if (chainId !== undefined) dispatch(actions.uniswapPairsRegistered({ pairs, chainId }));
  }, [dispatch, pairs, chainId]);

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
          convert.toUniswapSDKPair({ network: { chainId } }, entry)
        ) as Pair[];

        return [uniSdkPairs, false];
      } else {
        return [undefined, true];
      }
    } catch (error) {
      return [undefined, true];
    }
  }, [pairDatas, isLoading, chainId]);
}

export function useCommonUniswapPairs(
  baseTokens: string[]
): [Pair[], false] | [undefined, true] {
  const chainId = useChainId()
  const pairs = useMemo(() => buildUniswapPairs(baseTokens, chainId), [baseTokens, chainId]);
  return useUniswapPairs(pairs);
}

export function getTokenValue(
  calculateBestTradeForExactInput: (tokenIn: NormalizedToken, tokenOut: NormalizedToken, amountIn: BigNumber, opts?: BestTradeOptions | undefined) => Trade | undefined,
  tokenIn: NormalizedToken,
  tokenOut: NormalizedToken,
  amountIn: BigNumber
) {
  if (tokenIn.id.toLowerCase() === tokenOut.id.toLowerCase()) {
    return amountIn
  }
  const bestTrade = calculateBestTradeForExactInput(tokenIn, tokenOut, amountIn, { maxNumResults: 1, maxHops: 2 });
  if (!bestTrade) return null;
  return convert.toBigNumber(bestTrade.outputAmount.raw.toString(10))
}

type TradeOptions = BestTradeOptions & {
  tokenPairSubset?: string[][]
}

export function useUniswapTradingPairs(baseTokens: string[]) {
  const [pairs, loading] = useCommonUniswapPairs(baseTokens);
  const chainId = useChainId() as ChainId
  console.log(`Using ${pairs?.length} Uniswap Pairs. Loading: ${loading}`)
  const calculateBestTradeForExactInput = useCallback(
    (
      tokenIn: NormalizedToken,
      tokenOut: NormalizedToken,
      amountIn: BigNumber,
      {tokenPairSubset, ...opts}: TradeOptions = {}
    ): Trade | undefined => {
      if (!loading) {
        const allowedPairIds = tokenPairSubset
        ? tokenPairSubset.reduce((arr, [a, b]) => ([
          ...arr,
          computeUniswapPairAddress(a, b, chainId).toLowerCase(),
          computeSushiswapPairAddress(a, b, chainId).toLowerCase()
        ]), [])
        : (pairs as Pair[]).map(p => p.liquidityToken.address.toLowerCase());
        const allowedPairs = (pairs as Pair[]).filter((p) => allowedPairIds.includes(p.liquidityToken.address.toLowerCase()))
        const [bestTrade] = bestTradeExactIn(
          allowedPairs as Pair[],
          convert.toUniswapSDKCurrencyAmount(
            { network: { chainId } },
            tokenIn,
            amountIn,
          ) as TokenAmount,
          convert.toUniswapSDKCurrency(
            { network: { chainId} },
            tokenOut
          ) as Token,
          opts ?? { maxHops: 3, maxNumResults: 1 }
        );
        return bestTrade;
      }
    },
    [loading, pairs, chainId]
  );
  const calculateBestTradeForExactOutput = useCallback(
    (
      tokenIn: NormalizedToken,
      tokenOut: NormalizedToken,
      amountOut: BigNumber,
      {tokenPairSubset, ...opts}: TradeOptions = {}
    ): Trade | undefined => {
      if (!loading) {
        const allowedPairIds = tokenPairSubset
          ? tokenPairSubset.reduce((arr, [a, b]) => ([
            ...arr,
            computeUniswapPairAddress(a, b, chainId).toLowerCase(),
            computeSushiswapPairAddress(a, b, chainId).toLowerCase()
          ]), [])
          : (pairs as Pair[]).map(p => p.liquidityToken.address.toLowerCase());
        const allowedPairs = (pairs as Pair[]).filter((p) => allowedPairIds.includes(p.liquidityToken.address.toLowerCase()))
        const [bestTrade] = bestTradeExactOut(
          allowedPairs,
          convert.toUniswapSDKCurrency(
            { network: { chainId } },
            tokenIn
          ) as Token,
          convert.toUniswapSDKCurrencyAmount(
            { network: { chainId } },
            tokenOut,
            amountOut,
          ) as TokenAmount,
          opts ?? { maxHops: 3, maxNumResults: 1 }
        );

        return bestTrade;
      }
    },
    [loading, pairs, chainId]
  );

  return {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
    loading,
    pairs
  };
}
// #endregion
