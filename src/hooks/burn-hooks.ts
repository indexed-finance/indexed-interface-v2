import { AppState, selectors } from "features";
import { COMMON_BASE_TOKENS, SLIPPAGE_RATE } from "config";
import {
  _calcAllOutGivenPoolIn,
  calcPoolInGivenSingleOut,
  calcSingleOutGivenPoolIn,
  downwardSlippage,
  upwardSlippage,
} from "ethereum";
import { convert } from "helpers";
import {
  useBurnMultiTransactionCallback,
  useBurnSingleTransactionCallbacks,
  useRoutedBurnTransactionCallbacks
} from "./transaction-hooks";
import { useCallback, useMemo } from "react";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "./pool-hooks";
import { useSelector } from "react-redux";
import { useTokenLookupBySymbol } from "./token-hooks";
import { useUniswapTradingPairs } from "./pair-hooks";
import type { BigNumber } from "ethereum";
import type { Trade } from "@uniswap/sdk";

// #region Token
export function useSingleTokenBurnCallbacks(poolId: string) {
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const { burnExactAmountIn, burnExactAmountOut } = useBurnSingleTransactionCallbacks(poolId);
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
          const result = calcPoolInGivenSingleOut(pool, outputToken, amountOut);
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
          const result = calcSingleOutGivenPoolIn(pool, outputToken, amountIn);
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
        if (result && !result.error) {
          return burnExactAmountIn(
            result.tokenOut,
            result.amountIn,
            downwardSlippage(
              result.tokenAmountOut as BigNumber,
              SLIPPAGE_RATE
            )
          );
        }
      } else {
        const result = calculateAmountIn(tokenOutSymbol, typedAmount);
        if (result && !result.error) {
          return burnExactAmountOut(
            result.tokenOut,
            result.amountOut,
            upwardSlippage(result.poolAmountIn as BigNumber, SLIPPAGE_RATE)
          );
        }
      }
      return Promise.reject();
    },
    [calculateAmountIn, calculateAmountOut, burnExactAmountIn, burnExactAmountOut]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeBurn,
  };
}
// #endregion

export function useMultiTokenBurnCallbacks(poolId: string) {
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const exitPool = useBurnMultiTransactionCallback(poolId);
  const calculateAmountsOut = useCallback(
    (typedAmountIn: string) => {
      if (pool) {
        const balances = pool.tokensList.map(
          (token) => pool.tokens.entities[token].balance
        );
        const denorms = pool.tokensList.map(
          (token) => pool.tokens.entities[token].denorm
        );
        const totalSupply = pool.totalSupply;
        const poolAmountIn = convert.toToken(typedAmountIn, 18);

        return {
          tokens: [...pool.tokensList], // Simplify the form's token lookup to convert amounts to strings
          amountsOut: _calcAllOutGivenPoolIn(
            balances.map(convert.toBigNumber),
            denorms.map(convert.toBigNumber),
            convert.toBigNumber(totalSupply),
            poolAmountIn
          ),
          poolAmountIn,
        };
      }
    },
    [pool]
  );
  const executeBurn = useCallback(
    (typedAmountIn: string) => {
      const result = calculateAmountsOut(typedAmountIn);
      if (result) {
        exitPool(
          result.poolAmountIn,
          result.amountsOut.map((amount) =>
            upwardSlippage(amount, SLIPPAGE_RATE)
          )
        )
      } else {
        Promise.reject()
      }
    },
    [exitPool, calculateAmountsOut]
  );

  return { calculateAmountsOut, executeBurn };
}

// #region Routing
export function useBurnRouterCallbacks(poolId: string) {
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
  const { burnExactAmountIn, burnExactAmountOut } = useRoutedBurnTransactionCallbacks(poolId);
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
        const result = getBestBurnRouteForAmountIn(
          tokenOutSymbol,
          typedAmount
        );
        if (result && !result.poolResult.error) {
          return burnExactAmountIn(
            result.poolResult.amountIn,
            result.uniswapResult.route.path.map((p) => p.address),
            downwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.outputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            )
          );
        }
      } else {
        const result = getBestBurnRouteForAmountOut(
          tokenOutSymbol,
          typedAmount
        );
        if (result && !result.poolResult.error) {
          return burnExactAmountOut(
            upwardSlippage(result.poolResult.poolAmountIn, SLIPPAGE_RATE),
            result.uniswapResult.route.path.map((p) => p.address),
            convert.toBigNumber(result.uniswapResult.outputAmount.raw.toString(10))
          );
        }
      }
      Promise.reject();
    },
    [getBestBurnRouteForAmountIn, getBestBurnRouteForAmountOut, burnExactAmountIn, burnExactAmountOut]
  );

  return {
    tokenIds,
    getBestBurnRouteForAmountIn,
    getBestBurnRouteForAmountOut,
    executeRoutedBurn,
  };
}
// #endregion
