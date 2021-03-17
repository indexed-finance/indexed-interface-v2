import { BigNumber } from "ethereum/utils/balancer-math";
import { COMMON_BASE_TOKENS } from "config";
import { Trade } from "@uniswap/sdk";
import { convert } from "helpers";
import { useCallback, useMemo, useRef } from "react";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "features/indexPools/hooks";
import { useSingleTokenMintCallbacks } from "./use-mint-callbacks";
import { useTokenLookupBySymbol } from "features/tokens/hooks";
import useUniswapTradingPairs from "./use-uniswap-trading-pairs";

export default function useMintRouterCallbacks(poolId: string) {
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);
  const idsRef = useRef(poolTokenIds);
  if (JSON.stringify(poolTokenIds) !== JSON.stringify(idsRef.current)) {
    idsRef.current = poolTokenIds;
  }
  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const tokenIds = useMemo(() => ([
    ...idsRef.current,
    ...COMMON_BASE_TOKENS.map(t => t.id)
  ]), [idsRef]);

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
    console.log(`Comparing tokens...`);
    const timesUni: number[] = [];
    const timesPool: number[] = [];

    const allResults = poolTokens.map((token) => {
      const normalizedOutput = tokenLookupBySymbol[token.token.symbol.toLowerCase()];
      if (!normalizedOutput) return null;
      const start = Date.now();
      const uniswapResult = calculateBestTradeForExactInput(
        normalizedInput,
        normalizedOutput,
        exactAmountIn,
        { maxHops: 2, maxNumResults: 1 }
      );
      const end = Date.now();
      timesUni.push(end - start);

      if (uniswapResult) {
        const start2 = Date.now();
        const poolResult = calculateAmountOut(normalizedOutput.symbol, uniswapResult.outputAmount.toExact());
        const end2 = Date.now();
        timesPool.push(end2 - start2);
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

    console.log(`Compared tokens!`);
    allResults.sort((a, b) =>
      b.poolResult.poolAmountOut.gt(a.poolResult.poolAmountOut) ? 1 : -1
    );
    const avgUni = timesUni.reduce((a, b) => a+b, 0) / timesUni.length;
    const avgPool = timesPool.reduce((a, b) => a+b, 0) / timesPool.length;
    console.log(`Average UNI time: ${avgUni}`)
    console.log(`Average Pool time: ${avgPool}`)
    const bestResult = allResults[0];
    return bestResult;
  }, [tokenLookupBySymbol, poolTokens, calculateAmountOut, calculateBestTradeForExactInput]);

  return {
    tokenIds,
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut
  };
}