import * as balancerMath from "./utils/balancer-math";
import { AppState, FormattedPair, actions, selectors } from "features";
import { BigNumber } from "bignumber.js";
import { NormalizedToken, PoolTokenUpdate } from "./types.d";
import { Pair, Token, TokenAmount, Trade } from "@uniswap/sdk";
import { bestTradeExactIn, bestTradeExactOut, buildCommonTokenPairs, computeUniswapPairAddress, sortTokens } from "./utils/uniswap";
import { convert } from "helpers";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export * from "./utils";
export * from "./subgraph";
export * from "./multicall";
export * from "./transactions";

export const ZERO = balancerMath.ZERO;
export const ONE = balancerMath.ONE;
export const BONE = balancerMath.BONE;

type PoolTokenData = {
  usedDenorm: string;
  usedBalance: string;
};

export async function calculateOutputFromInput(
  inputData: PoolTokenData,
  outputData: PoolTokenData,
  inputAmount: string,
  swapFee: BigNumber
) {
  const badResult = {
    outputAmount: parseFloat(convert.toBalance(ZERO)),
    price: ZERO,
    spotPriceAfter: ZERO,
    isGoodResult: false,
  };

  if (inputData && outputData) {
    // --
    const [balanceIn, weightIn, balanceOut, weightOut, amountIn] = [
      convert.toBigNumber(inputData.usedBalance),
      convert.toBigNumber(inputData.usedDenorm),
      convert.toBigNumber(outputData.usedBalance),
      convert.toBigNumber(outputData.usedDenorm),
      convert.toToken(inputAmount),
    ];
    if (amountIn.isLessThanOrEqualTo(balanceIn.div(2))) {
      const amountOut = balancerMath.calcOutGivenIn(
        balanceIn,
        weightIn,
        balanceOut,
        weightOut,
        amountIn,
        swapFee
      );

      const spotPriceAfter = balancerMath.calcSpotPrice(
        balanceIn.plus(amountIn),
        weightIn,
        balanceOut.minus(amountOut),
        weightOut,
        swapFee
      );

      let price: BigNumber = ZERO;

      // Next, compute the price.
      if (amountIn.isEqualTo(0) || amountOut.isEqualTo(0)) {
        const oneToken = BONE;
        const preciseInput = balancerMath.calcOutGivenIn(
          balanceIn,
          weightIn,
          balanceOut,
          weightOut,
          oneToken,
          swapFee
        );
        const preciseOutput = preciseInput.dividedBy(BONE);

        price = preciseOutput.dividedBy(ONE);
      } else {
        const preciseInput = amountIn.dividedBy(BONE);
        const preciseOutput = amountOut.dividedBy(BONE);

        price = preciseOutput.dividedBy(preciseInput);
      }

      return {
        outputAmount: parseFloat(convert.toBalance(amountOut)),
        price,
        spotPriceAfter,
        isGoodResult: true,
      };
    } else {
      return badResult;
    }
  } else {
    return badResult;
  }
}

export async function calculateInputFromOutput(
  inputData: PoolTokenData,
  outputData: PoolTokenUpdate,
  outputAmount: string,
  swapFee: BigNumber
) {
  const badResult = {
    inputAmount: parseFloat(convert.toBalance(ZERO)),
    price: ZERO,
    spotPriceAfter: ZERO,
    isGoodResult: false,
  };

  const {
    usedBalance: inputUsedBalance,
    usedDenorm: inputUsedDenorm,
  } = inputData;
  const {
    balance: outputBalance,
    usedBalance: outputUsedBalance,
    denorm: outputDenorm,
    usedDenorm: outputUsedDenorm,
  } = outputData;

  if (inputData && outputData) {
    const [balanceIn, weightIn, balanceOut, weightOut, amountOut] = [
      inputUsedBalance,
      inputUsedDenorm,
      outputBalance,
      outputDenorm,
      convert.toToken(outputAmount.toString()),
    ]
      .filter(Boolean)
      .map((property) => convert.toBigNumber(property!));

    if (
      amountOut.isLessThanOrEqualTo(
        convert.toBigNumber(outputUsedBalance).div(3)
      )
    ) {
      const amountIn = balancerMath.calcInGivenOut(
        balanceIn,
        weightIn,
        balanceOut,
        weightOut,
        amountOut,
        swapFee
      );
      const spotPriceAfter = balancerMath.calcSpotPrice(
        balanceIn.plus(amountIn),
        weightIn,
        convert.toBigNumber(outputUsedBalance).minus(amountOut),
        convert.toBigNumber(outputUsedDenorm),
        swapFee
      );

      return {
        inputAmount: parseFloat(convert.toBalance(amountIn)),
        spotPriceAfter,
        isGoodResult: true,
      };
    } else {
      return badResult;
    }
  } else {
    return badResult;
  }
}

export function useUniswapPairs(
  baseTokens: string[]
): [Pair[], false] | [undefined, true] {
  const dispatch = useDispatch();
  const [tokenPairs, pairAddresses] = useMemo(() => {
    const _tokenPairs = buildCommonTokenPairs(baseTokens);
    const _pairAddresses = _tokenPairs.map(([tokenA, tokenB]) => computeUniswapPairAddress(tokenA, tokenB));
    return [_tokenPairs, _pairAddresses];
  }, [JSON.stringify(baseTokens)]);

  useEffect(() => {
    const pairs = tokenPairs.map(([tokenA, tokenB]) => {
      const [token0, token1] = sortTokens(tokenA, tokenB);
      const pair = computeUniswapPairAddress(token0, token1);
      return { id: pair, exists: undefined, token0, token1 };
    })
    dispatch(actions.uniswapPairsRegistered(pairs));
    const listenerId = (dispatch(
      actions.registerPairReservesDataListener(pairAddresses)
    ) as unknown) as string;
    return () => {
      dispatch(actions.listenerUnregistered(listenerId));
    }
  }, [dispatch, JSON.stringify(pairAddresses)]);

  const pairDatas = useSelector(
    (state: AppState) => selectors.selectFormattedPairsById(state, pairAddresses)
  );

  return useMemo(() => {
    const loading = pairDatas.some((p) => !p || typeof p.exists === "undefined");
    if (loading) {
      return [undefined, true];
    }
    const goodPairs = (pairDatas as FormattedPair[]).filter(p => p.exists);
    const uniSdkPairs = goodPairs.map(convert.toUniswapSDKPair) as Pair[];
    return [uniSdkPairs, false];
  }, [pairDatas]);
}

export function useUniswapTradingPairs(
  baseTokens: string[]
) {
  const [pairs, loading] = useUniswapPairs(baseTokens);

  const calculateBestTradeForExactInput = useCallback((
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
  }, [loading, pairs]);

  const calculateBestTradeForExactOutput = useCallback((
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
  }, [loading, pairs]);

  return {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput
  }
}