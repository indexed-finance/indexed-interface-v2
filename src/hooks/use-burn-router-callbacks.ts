import { BigNumber } from "ethereum/utils/balancer-math";
import { COMMON_BASE_TOKENS, SLIPPAGE_RATE } from "config";
import { Trade } from "@uniswap/sdk";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { thunks } from "features";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  usePoolTokenAddresses,
  usePoolUnderlyingTokens,
} from "features/indexPools/hooks";
import { useSingleTokenBurnCallbacks } from "./use-burn-callbacks";
import { useTokenLookupBySymbol } from "features/tokens/hooks";
import { useUniswapTradingPairs } from "./use-uniswap-trading-pairs";

export function useBurnRouterCallbacks(poolId: string) {
  const dispatch = useDispatch();
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);
  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const tokenIds = useMemo(
    () => [...poolTokenIds, ...COMMON_BASE_TOKENS.map(({ id }) => id)],
    [poolTokenIds]
  );

  const { calculateAmountIn, calculateAmountOut } = useSingleTokenBurnCallbacks(
    poolId
  );
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);

  const getBestBurnRouteForAmountOut = useCallback(
    (tokenOutSymbol: string, typedTokenAmountOut: string) => {
      const normalizedOutput =
        tokenLookupBySymbol[tokenOutSymbol.toLowerCase()];
      const exactAmountOut = convert.toToken(
        typedTokenAmountOut,
        normalizedOutput.decimals
      );
      const allResults = poolTokens
        .map((token) => {
          if (!token.ready) return null;
          const normalizedPoolTokenOut =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedPoolTokenOut) return null;

          const uniswapResult = calculateBestTradeForExactOutput(
            normalizedPoolTokenOut,
            normalizedOutput,
            exactAmountOut.toString(10),
            { maxHops: 2, maxNumResults: 1 }
          );
          if (uniswapResult) {
            const poolResult = calculateAmountIn(
              normalizedPoolTokenOut.symbol,
              uniswapResult.inputAmount.toExact()
            );
            if (poolResult) {
              if (poolResult.error) {
                return { poolResult };
              }
              if (poolResult.poolAmountIn) {
                return {
                  poolResult,
                  uniswapResult,
                };
              }
            }
          }
          return null;
        })
        .filter((_) => _) as Array<{
        poolResult: {
          error?: string;
          poolAmountIn: BigNumber;
          tokenOut: string;
          amountOut: BigNumber;
        };
        uniswapResult: Trade;
      }>;
      allResults.sort((a, b) =>
        a.poolResult.poolAmountIn.gt(b.poolResult.poolAmountIn) ? 1 : -1
      );
      const bestResult = allResults[0];
      return bestResult;
    },
    [
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountIn,
      calculateBestTradeForExactOutput,
    ]
  );

  const getBestBurnRouteForAmountIn = useCallback(
    (tokenOutSymbol: string, typedPoolAmountIn: string) => {
      const normalizedOutput =
        tokenLookupBySymbol[tokenOutSymbol.toLowerCase()];

      const allResults = poolTokens
        .map((token) => {
          if (!token.ready) return null;
          const normalizedPoolTokenOut =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedPoolTokenOut) return null;
          const poolResult = calculateAmountOut(
            normalizedPoolTokenOut.symbol,
            typedPoolAmountIn
          );
          if (poolResult) {
            if (poolResult.error) {
              return { poolResult };
            }
            if (poolResult.tokenAmountOut) {
              const uniswapResult = calculateBestTradeForExactInput(
                normalizedPoolTokenOut,
                normalizedOutput,
                poolResult.tokenAmountOut.toString(10),
                { maxHops: 2, maxNumResults: 1 }
              );
              if (uniswapResult) {
                return {
                  poolResult,
                  uniswapResult,
                };
              }
            }
          }
          return null;
        })
        .filter((_) => _ && !_.poolResult.error) as Array<{
        poolResult: {
          error?: string;
          tokenAmountOut: BigNumber;
          tokenOut: string;
          amountIn: BigNumber;
        };
        uniswapResult: Trade;
      }>;
      allResults.sort((a, b) =>
        b.uniswapResult.outputAmount.greaterThan(a.uniswapResult.outputAmount)
          ? 1
          : -1
      );
      const bestResult = allResults[0];
      return bestResult;
    },
    [
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountOut,
      calculateBestTradeForExactInput,
    ]
  );

  const executeRoutedBurn = useCallback(
    (
      tokenOutSymbol: string,
      specifiedField: "from" | "to",
      typedAmount: string
    ) => {
      if (specifiedField === "from") {
        const result = getBestBurnRouteForAmountIn(tokenOutSymbol, typedAmount);
        if (!result)
          throw Error("Caught error calculating routed burn output.");
        if (result.poolResult.error)
          throw Error(
            `Caught error calculating routed burn output: ${result.poolResult.error}`
          );
        dispatch(
          thunks.burnExactAndSwapForTokens(
            poolId,
            result.poolResult.amountIn,
            result.uniswapResult.route.path.map((p) => p.address),
            downwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.outputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            )
          )
        );
      } else {
        const result = getBestBurnRouteForAmountOut(
          tokenOutSymbol,
          typedAmount
        );
        if (!result) throw Error("Caught error calculating routed burn input.");
        if (result.poolResult.error)
          throw Error(
            `Caught error calculating routed burn input: ${result.poolResult.error}`
          );
        dispatch(
          thunks.burnAndSwapForExactTokens(
            poolId,
            upwardSlippage(result.poolResult.poolAmountIn, SLIPPAGE_RATE),
            result.uniswapResult.route.path.map((p) => p.address),
            convert.toBigNumber(
              result.uniswapResult.outputAmount.raw.toString(10)
            )
          )
        );
      }
    },
    [
      dispatch,
      getBestBurnRouteForAmountIn,
      getBestBurnRouteForAmountOut,
      poolId,
    ]
  );

  return {
    tokenIds,
    getBestBurnRouteForAmountIn,
    getBestBurnRouteForAmountOut,
    executeRoutedBurn,
  };
}
