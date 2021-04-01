import { AppState, selectors, thunks } from "features";
import { COMMON_BASE_TOKENS, SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, ethereumHelpers, upwardSlippage } from "ethereum";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "./pool-hooks";
import { useTokenLookupBySymbol } from "./token-hooks";
import { useUniswapTradingPairs } from "./pair-hooks";
import type { BigNumber } from "ethereum";
import type { Trade } from "@uniswap/sdk";

// #region Token
export function useSingleTokenBurnCallbacks(poolId: string) {
  const dispatch = useDispatch();
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const tokenLookup = useTokenLookupBySymbol();

  const calculateAmountIn = useCallback(
    (tokenOutSymbol: string, typedAmountOut: string) => {
      if (pool) {
        const outputToken =
          pool.tokens.entities[
            tokenLookup[tokenOutSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (outputToken) {
          const amountOut = convert.toToken(typedAmountOut, 18);
          const tokenOut = outputToken.token.id;
          const result = ethereumHelpers.calcPoolInGivenSingleOut(
            pool,
            outputToken,
            amountOut
          );
          return {
            tokenOut,
            amountOut,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );

  const calculateAmountOut = useCallback(
    (tokenOutSymbol: string, typedAmountIn: string) => {
      if (pool) {
        const outputToken =
          pool.tokens.entities[
            tokenLookup[tokenOutSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (outputToken) {
          const amountIn = convert.toToken(typedAmountIn, 18);
          const tokenOut = outputToken.token.id;
          const result = ethereumHelpers.calcSingleOutGivenPoolIn(
            pool,
            outputToken,
            amountIn
          );
          return {
            tokenOut,
            amountIn,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );

  const executeBurn = useCallback(
    (
      tokenOutSymbol: string,
      specifiedField: "from" | "to",
      typedAmount: string
    ) => {
      if (specifiedField === "from") {
        const result = calculateAmountOut(tokenOutSymbol, typedAmount);
        if (!result) throw Error(`Caught error calculating burn output.`);
        if (result.error)
          throw Error(`Caught error calculating burn output: ${result.error}`);
        const minTokenAmountOut = downwardSlippage(
          result.tokenAmountOut as BigNumber,
          SLIPPAGE_RATE
        );
        dispatch(
          thunks.exitswapPoolAmountIn(
            poolId,
            result.tokenOut,
            result.amountIn,
            minTokenAmountOut
          )
        );
      } else {
        const result = calculateAmountIn(tokenOutSymbol, typedAmount);
        if (!result) throw Error(`Caught error calculating burn input.`);
        if (result.error)
          throw Error(`Caught error calculating burn input: ${result.error}`);
        const maxAmountIn = upwardSlippage(
          result.poolAmountIn as BigNumber,
          SLIPPAGE_RATE
        );
        dispatch(
          thunks.exitswapExternAmountOut(
            poolId,
            result.tokenOut,
            result.amountOut,
            maxAmountIn
          )
        );
      }
    },
    [dispatch, calculateAmountIn, calculateAmountOut, poolId]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeBurn,
  };
}
// #endregion

// #region Routing
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
// #endregion
