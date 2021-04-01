import { actions, provider, selectors } from "features";
import {
  bestTradeExactIn,
  bestTradeExactOut,
  buildCommonTokenPairs,
  computeUniswapPairAddress,
  sortTokens,
} from "ethereum";
import { convert } from "helpers";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppState, FormattedPair } from "features";
import type {
  BestTradeOptions,
  Pair,
  Token,
  TokenAmount,
  Trade,
} from "@uniswap/sdk";
import type { NormalizedToken } from "ethereum";
import type { RegisteredCall } from "helpers";

export const PAIR_DATA_CALLER = "Pair Data";

export type RegisteredPair = {
  id: string;
  token0: string;
  token1: string;
  exists?: boolean;
};

export function createPairDataCalls(pairs: RegisteredPair[]): RegisteredCall[] {
  return pairs.map((pair) => ({
    caller: PAIR_DATA_CALLER,
    interfaceKind: "Pair_ABI",
    target: pair.id,
    function: "getReserves",
  }));
}

export function usePairDataRegistrar(
  pairs: RegisteredPair[],
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
  useCallRegistrar(
    {
      caller: PAIR_DATA_CALLER,
      onChainCalls: createPairDataCalls(pairs),
    },
    actions,
    selectors
  );
}

// #region Uniswap
type PairToken = {
  id: string;
  exists: boolean | undefined;
  token0: string;
  token1: string;
};

export function buildUniswapPairs(baseTokens: string[]) {
  const tokenPairs = buildCommonTokenPairs(baseTokens);
  const pairs = tokenPairs.map(([tokenA, tokenB]) => {
    const [token0, token1] = sortTokens(tokenA, tokenB);
    const pair = computeUniswapPairAddress(token0, token1);

    return { id: pair, exists: undefined, token0, token1 };
  });

  return pairs;
}

export function useUniswapPairs(
  pairs: PairToken[]
): [Pair[], false] | [undefined, true] {
  const dispatch = useDispatch();
  const pairDatas = useSelector((state: AppState) =>
    selectors.selectFormattedPairsById(
      state,
      pairs.map((p) => p.id)
    )
  );

  useEffect(() => {
    dispatch(actions.uniswapPairsRegistered(pairs));
  }, [dispatch, pairs]);

  usePairDataRegistrar(pairs, actions, selectors);

  return useMemo(() => {
    const loading = pairDatas.some(
      (p) => !p || typeof p.exists === "undefined"
    );
    if (provider && !loading) {
      const goodPairs = (pairDatas as FormattedPair[]).filter(
        ({ exists }) => exists
      );
      const uniSdkPairs = goodPairs.map((entry) =>
        convert.toUniswapSDKPair(provider!, entry)
      ) as Pair[];

      return [uniSdkPairs, false];
    } else {
      return [undefined, true];
    }
  }, [pairDatas]);
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
      amountIn: string, // Should be formatted as a token amount in base 10 or hex
      opts?: BestTradeOptions
    ): Trade | undefined => {
      if (provider && !loading) {
        const [bestTrade] = bestTradeExactIn(
          pairs as Pair[],
          convert.toUniswapSDKTokenAmount(
            provider,
            tokenIn,
            amountIn
          ) as TokenAmount,
          convert.toUniswapSDKToken(provider, tokenOut) as Token,
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
      amountOut: string, // Should be formatted as a token amount
      opts?: BestTradeOptions
    ): Trade | undefined => {
      if (provider && !loading) {
        const [bestTrade] = bestTradeExactOut(
          pairs as Pair[],
          convert.toUniswapSDKToken(provider, tokenIn) as Token,
          convert.toUniswapSDKTokenAmount(
            provider,
            tokenOut,
            amountOut
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
  };
}
// #endregion