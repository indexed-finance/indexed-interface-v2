import { AppState, selectors } from "features";
import { Currency, Trade } from "@indexed-finance/narwhal-sdk";
import { SLIPPAGE_RATE } from "config";
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
  useRoutedBurnTransactionCallbacks,
} from "./transaction-hooks";
import { useCallback, useMemo } from "react";
import { useCommonBaseTokens, useTokenLookupBySymbol } from "./token-hooks";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "./pool-hooks";
import { useSelector } from "react-redux";
import { useUniswapTradingPairs } from "./pair-hooks";
import type { BigNumber } from "ethereum";

// #region Token
export function useSingleTokenBurnCallbacks(poolId: string) {
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const { burnExactAmountIn, burnExactAmountOut } =
    useBurnSingleTransactionCallbacks(poolId);
  const tokenLookup = useTokenLookupBySymbol();
  const calculateAmountIn = useCallback(
    (tokenOutSymbol: string, amountOut: BigNumber) => {
      if (pool) {
        const outputToken =
          pool.tokens.entities[
            tokenLookup[tokenOutSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (outputToken) {
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
    (tokenOutSymbol: string, amountIn: BigNumber) => {
      if (pool) {
        const outputToken =
          pool.tokens.entities[
            tokenLookup[tokenOutSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (outputToken) {
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
      amount: BigNumber
    ) => {
      if (specifiedField === "from") {
        const result = calculateAmountOut(tokenOutSymbol, amount);

        if (result && !result.error) {
          return burnExactAmountIn(
            result.tokenOut,
            result.amountIn,
            downwardSlippage(result.tokenAmountOut as BigNumber, SLIPPAGE_RATE)
          );
        }
      } else {
        const result = calculateAmountIn(tokenOutSymbol, amount);

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
    [
      calculateAmountIn,
      calculateAmountOut,
      burnExactAmountIn,
      burnExactAmountOut,
    ]
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
            downwardSlippage(amount, SLIPPAGE_RATE)
          )
        );
      } else {
        Promise.reject();
      }
    },
    [exitPool, calculateAmountsOut]
  );

  return { calculateAmountsOut, executeBurn };
}

const conflictTokenAddress = '0x8762db106b2c2a0bccb3a80d1ed41273552616e8';

// #region Routing
export function useBurnRouterCallbacks(poolId: string) {
  const baseTokens = useCommonBaseTokens()
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);
  const tokenLookupBySymbol = useTokenLookupBySymbol();

  const tokenIds = useMemo(
    () => [...poolTokenIds, ...baseTokens.map(({ id }) => id)],
    [poolTokenIds, baseTokens]
  );
  const { calculateAmountIn, calculateAmountOut } =
    useSingleTokenBurnCallbacks(poolId);
  const { burnExactAmountIn, burnExactAmountOut } =
    useRoutedBurnTransactionCallbacks(poolId);
  const { calculateBestTradeForExactInput, calculateBestTradeForExactOutput } =
    useUniswapTradingPairs(tokenIds);
  const getBestBurnRouteForAmountOut = useCallback(
    (tokenOutSymbol: string, amountOut: BigNumber) => {
      const normalizedOutput =
        tokenLookupBySymbol[tokenOutSymbol.toLowerCase()];
      const allResults =  poolTokens.filter(e =>
          e.address !== conflictTokenAddress
        ).map((token) => {
          if (!token.ready) return null;
          const normalizedPoolTokenOut =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedPoolTokenOut) return null;

          const uniswapResult = calculateBestTradeForExactOutput(
            normalizedPoolTokenOut,
            normalizedOutput,
            amountOut,
            { maxHops: 2, maxNumResults: 1 }
          );
          if (uniswapResult) {
            const poolResult = calculateAmountIn(
              normalizedPoolTokenOut.symbol,
              convert.toBigNumber(uniswapResult.inputAmount.raw.toString())
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
    (tokenOutSymbol: string, amountIn: BigNumber) => {
      const normalizedOutput =
        tokenLookupBySymbol[tokenOutSymbol.toLowerCase()];

      const allResults = poolTokens.filter(e =>
          e.address !== conflictTokenAddress
        ).map((token) => {
          if (!token.ready) return null;
          const normalizedPoolTokenOut =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedPoolTokenOut) return null;
          const poolResult = calculateAmountOut(
            normalizedPoolTokenOut.symbol,
            amountIn
          );
          if (poolResult) {
            if (poolResult.error) {
              return { poolResult };
            }
            if (poolResult.tokenAmountOut) {
              const uniswapResult = calculateBestTradeForExactInput(
                normalizedPoolTokenOut,
                normalizedOutput,
                poolResult.tokenAmountOut,
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
      amount: BigNumber
    ) => {
      if (specifiedField === "from") {
        const result = getBestBurnRouteForAmountIn(tokenOutSymbol, amount);
        if (result && !result.poolResult.error) {
          return burnExactAmountIn(
            result.poolResult.amountIn,
            result.uniswapResult.route.encodedPath,
            downwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.outputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            ),
            result.uniswapResult.outputAmount.currency === Currency.ETHER
          );
        }
      } else {
        const result = getBestBurnRouteForAmountOut(tokenOutSymbol, amount);
        if (result && !result.poolResult.error) {
          return burnExactAmountOut(
            upwardSlippage(result.poolResult.poolAmountIn, SLIPPAGE_RATE),
            result.uniswapResult.route.encodedPath,
            convert.toBigNumber(
              result.uniswapResult.outputAmount.raw.toString(10)
            ),
            result.uniswapResult.outputAmount.currency === Currency.ETHER
          );
        }
      }
      Promise.reject();
    },
    [
      getBestBurnRouteForAmountIn,
      getBestBurnRouteForAmountOut,
      burnExactAmountIn,
      burnExactAmountOut,
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
