import { BigNumber } from "ethereum/utils/balancer-math";
import { COMMON_BASE_TOKENS } from "config";
import { Trade } from "@uniswap/sdk";
import { convert } from "helpers";
import { useCallback, useEffect, useMemo } from "react";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "features/indexPools/hooks";
import { useSingleTokenMintCallbacks } from "./use-mint-callbacks";
import { useTokenLookupBySymbol } from "features/tokens/hooks";
import useUniswapTradingPairs from "./use-uniswap-trading-pairs";

export default function useMintRouterCallbacks(poolId: string) {
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);

  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const tokenIds = useMemo(() => ([
    ...poolTokenIds,
    ...COMMON_BASE_TOKENS.map(t => t.id)
  ]), [poolTokenIds]);

  const { calculateAmountIn, calculateAmountOut } = useSingleTokenMintCallbacks(poolId);
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);

  const getBestMintRouteForAmountOut = useCallback((tokenInSymbol: string, typedPoolAmountOut: string) => {
    const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
    const allResults = poolTokens.map((token) => {
      const normalizedOutput = tokenLookupBySymbol[token.token.symbol.toLowerCase()];
      if (!normalizedOutput) return null;
      const poolResult = calculateAmountIn(normalizedOutput.symbol, typedPoolAmountOut);
      if (poolResult) {
        if (poolResult.error) {
          return { poolResult };
        }
        if (poolResult.tokenAmountIn) {
          const uniswapResult = calculateBestTradeForExactOutput(
            normalizedInput,
            normalizedOutput,
            poolResult.tokenAmountIn.toString(10),
            { maxHops: 2, maxNumResults: 1 }
          );
          if (uniswapResult) {
            return {
              poolResult,
              uniswapResult
            }
          }
        }
      }
      return null;
    }).filter(_ => _) as Array<{
      poolResult: {
        error?: string;
        tokenAmountIn: BigNumber;
        tokenIn: string;
        amountOut: BigNumber;
      };
      uniswapResult: Trade;
    }>;
    allResults.sort((a, b) =>
      a.uniswapResult.inputAmount.greaterThan(b.uniswapResult.inputAmount) ? 1 : -1
    );
    const bestResult = allResults[0];
    return bestResult;
  }, [tokenLookupBySymbol, poolTokens, calculateAmountIn, calculateBestTradeForExactOutput]);

  const getBestMintRouteForAmountIn = useCallback((tokenInSymbol: string, typedTokenAmountIn: string) => {
    const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
    const exactAmountIn = convert.toToken(typedTokenAmountIn, normalizedInput.decimals).toString(10);

    const allResults = poolTokens.map((token) => {
      const normalizedOutput = tokenLookupBySymbol[token.token.symbol.toLowerCase()];
      if (!normalizedOutput) return null;
      const uniswapResult = calculateBestTradeForExactInput(
        normalizedInput,
        normalizedOutput,
        exactAmountIn,
        { maxHops: 2, maxNumResults: 1 }
      );

      if (uniswapResult) {
        const poolResult = calculateAmountOut(normalizedOutput.symbol, uniswapResult.outputAmount.toExact());
        if (poolResult) {
          if (poolResult.error) {
            return { poolResult };
          }
          if (poolResult.poolAmountOut) {
            return {
              poolResult,
              uniswapResult
            }
          }
        }
      }
      return null;
    }).filter(_ => _ && !_.poolResult.error) as Array<{
      poolResult: {
        error?: string;
        poolAmountOut: BigNumber;
        tokenIn: string;
        amountIn: BigNumber;
      };
      uniswapResult: Trade;
    }>;
    allResults.sort((a, b) =>
      b.poolResult.poolAmountOut.gt(a.poolResult.poolAmountOut) ? 1 : -1
    );
    const bestResult = allResults[0];
    return bestResult;
  }, [tokenLookupBySymbol, poolTokens, calculateAmountOut, calculateBestTradeForExactInput]);

  return {
    tokenIds,
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut
  };
}