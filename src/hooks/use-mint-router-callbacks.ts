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
import { useSingleTokenMintCallbacks } from "./use-mint-callbacks";
import { useTokenLookupBySymbol } from "features/tokens/hooks";
import useUniswapTradingPairs from "./use-uniswap-trading-pairs";

export default function useMintRouterCallbacks(poolId: string) {
  const dispatch = useDispatch();
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);

  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const tokenIds = useMemo(
    () => [...poolTokenIds, ...COMMON_BASE_TOKENS.map(({ id }) => id)],
    [poolTokenIds]
  );

  const { calculateAmountIn, calculateAmountOut } = useSingleTokenMintCallbacks(
    poolId
  );
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);

  const getBestMintRouteForAmountOut = useCallback(
    (tokenInSymbol: string, typedPoolAmountOut: string) => {
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const allResults = poolTokens
        .map((token) => {
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedOutput) return null;
          const poolResult = calculateAmountIn(
            normalizedOutput.symbol,
            typedPoolAmountOut
          );
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
          tokenAmountIn: BigNumber;
          tokenIn: string;
          amountOut: BigNumber;
        };
        uniswapResult: Trade;
      }>;
      allResults.sort((a, b) =>
        a.uniswapResult.inputAmount.greaterThan(b.uniswapResult.inputAmount)
          ? 1
          : -1
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

  const getBestMintRouteForAmountIn = useCallback(
    (tokenInSymbol: string, typedTokenAmountIn: string) => {
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const exactAmountIn = convert
        .toToken(typedTokenAmountIn, normalizedInput.decimals)
        .toString(10);

      const allResults = poolTokens
        .map((token) => {
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedOutput) return null;
          const uniswapResult = calculateBestTradeForExactInput(
            normalizedInput,
            normalizedOutput,
            exactAmountIn,
            { maxHops: 2, maxNumResults: 1 }
          );

          if (uniswapResult) {
            const poolResult = calculateAmountOut(
              normalizedOutput.symbol,
              uniswapResult.outputAmount.toExact()
            );
            if (poolResult) {
              if (poolResult.error) {
                return { poolResult };
              }
              if (poolResult.poolAmountOut) {
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
    },
    [
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountOut,
      calculateBestTradeForExactInput,
    ]
  );

  const executeRoutedMint = useCallback((
    tokenInSymbol: string,
    specifiedField: "from" | "to",
    typedAmount: string
  ) => {
    if (specifiedField === "from") {
      const result = getBestMintRouteForAmountIn(tokenInSymbol, typedAmount);
      if (!result) throw Error('Caught error calculating routed mint output.');
      if (result.poolResult.error) throw Error(`Caught error calculating routed mint output: ${result.poolResult.error}`);
      dispatch(thunks.swapExactTokensForTokensAndMint(
        poolId,
        convert.toBigNumber(result.uniswapResult.inputAmount.raw.toString(10)),
        result.uniswapResult.route.path.map(p => p.address),
        downwardSlippage(result.poolResult.poolAmountOut, SLIPPAGE_RATE)
      ));
    } else {
      const result = getBestMintRouteForAmountOut(tokenInSymbol, typedAmount);
      if (!result) throw Error('Caught error calculating routed mint input.');
      if (result.poolResult.error) throw Error(`Caught error calculating routed mint input: ${result.poolResult.error}`);
      dispatch(thunks.swapTokensForTokensAndMintExact(
        poolId,
        upwardSlippage(convert.toBigNumber(result.uniswapResult.inputAmount.raw.toString(10)), SLIPPAGE_RATE),
        result.uniswapResult.route.path.map(p => p.address),
        result.poolResult.amountOut
      ))
    }
  }, [dispatch, getBestMintRouteForAmountOut, getBestMintRouteForAmountIn, poolId])

  return {
    tokenIds,
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint
  };
}
