import { Pair, Token, TokenAmount, Trade } from "@uniswap/sdk";
import { batcherHooks } from "./batcher";
import {
  bestTradeExactIn,
  bestTradeExactOut,
  buildCommonTokenPairs,
  computeUniswapPairAddress,
  sortTokens,
} from "ethereum/utils/uniswap";
import { convert } from "helpers";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import actions from "./thunks";
import selectors from "./selectors";
import type { AppState, FormattedPair } from "features";
import type { NormalizedToken } from "ethereum/types";

const hooks = {
  ...batcherHooks,
  useUniswapPairs,
  useUniswapTradingPairs,
};

export default hooks;

function useUniswapPairs(
  baseTokens: string[]
): [Pair[], false] | [undefined, true] {
  const dispatch = useDispatch();
  const [tokenPairs, pairAddresses] = useMemo(() => {
    const _tokenPairs = buildCommonTokenPairs(baseTokens);
    const _pairAddresses = _tokenPairs.map(([tokenA, tokenB]) =>
      computeUniswapPairAddress(tokenA, tokenB)
    );
    return [_tokenPairs, _pairAddresses];
  }, [baseTokens]);

  useEffect(() => {
    const pairs = tokenPairs.map(([tokenA, tokenB]) => {
      const [token0, token1] = sortTokens(tokenA, tokenB);
      const pair = computeUniswapPairAddress(token0, token1);
      return { id: pair, exists: undefined, token0, token1 };
    });
    dispatch(actions.uniswapPairsRegistered(pairs));
    const listenerId = (dispatch(
      actions.registerPairReservesDataListener(pairAddresses)
    ) as unknown) as string;
    return () => {
      dispatch(actions.listenerUnregistered(listenerId));
    };
  }, [dispatch, tokenPairs, pairAddresses]);

  const pairDatas = useSelector((state: AppState) =>
    selectors.selectFormattedPairsById(state, pairAddresses)
  );

  return useMemo(() => {
    const loading = pairDatas.some(
      (p) => !p || typeof p.exists === "undefined"
    );
    if (loading) {
      return [undefined, true];
    }
    const goodPairs = (pairDatas as FormattedPair[]).filter(
      ({ exists }) => exists
    );
    const uniSdkPairs = goodPairs.map(convert.toUniswapSDKPair) as Pair[];
    return [uniSdkPairs, false];
  }, [pairDatas]);
}

function useUniswapTradingPairs(baseTokens: string[]) {
  const [pairs, loading] = useUniswapPairs(baseTokens);

  const calculateBestTradeForExactInput = useCallback(
    (
      tokenIn: NormalizedToken,
      tokenOut: NormalizedToken,
      amountIn: string // Should be formatted as a token amount in base 10 or hex
    ): Trade | undefined => {
      if (loading) return undefined;
      const bestTrade = bestTradeExactIn(
        pairs as Pair[],
        convert.toUniswapSDKTokenAmount(tokenIn, amountIn) as TokenAmount,
        convert.toUniswapSDKToken(tokenOut) as Token,
        { maxHops: 3, maxNumResults: 1 }
      )[0];
      return bestTrade;
    },
    [loading, pairs]
  );

  const calculateBestTradeForExactOutput = useCallback(
    (
      tokenIn: NormalizedToken,
      tokenOut: NormalizedToken,
      amountOut: string // Should be formatted as a token amount
    ): Trade | undefined => {
      if (loading) return undefined;
      const bestTrade = bestTradeExactOut(
        pairs as Pair[],
        convert.toUniswapSDKToken(tokenIn) as Token,
        convert.toUniswapSDKTokenAmount(tokenOut, amountOut) as TokenAmount,
        { maxHops: 3, maxNumResults: 1 }
      )[0];
      return bestTrade;
    },
    [loading, pairs]
  );

  return {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  };
}
