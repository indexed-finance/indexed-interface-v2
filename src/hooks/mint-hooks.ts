import { AppState, selectors, useSigner } from "features";
import { BigNumber } from "ethereum";
import { COMMON_BASE_TOKENS, SLIPPAGE_RATE } from "config";
import { Currency, Trade } from "@indexed-finance/narwhal-sdk";
import {
  _calcAllInGivenPoolOut,
  calcPoolOutGivenSingleIn,
  calcSingleInGivenPoolOut,
  downwardSlippage,
  upwardSlippage,
} from "ethereum";
import { convert } from "helpers";
import { useCallback, useMemo } from "react";
import {
  useMintMultiTransactionCallback,
  useMintSingleTransactionCallbacks,
  useRoutedMintTransactionCallbacks,
} from "./transaction-hooks";
import { usePoolTokenAddresses, usePoolUnderlyingTokens } from "./pool-hooks";
import { useSelector } from "react-redux";
import { useTokenLookupBySymbol } from "./token-hooks";
import { useUniswapTradingPairs } from "./pair-hooks";

// #region Token
export function useSingleTokenMintCallbacks(poolId: string) {
  const signer = useSigner();
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const { joinswapExternAmountIn, joinswapPoolAmountOut } =
    useMintSingleTransactionCallbacks(poolId);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const calculateAmountIn = useCallback(
    (tokenInSymbol: string, amountOut: BigNumber) => {
      if (pool) {
        const inputToken =
          pool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (inputToken) {
          const tokenIn = inputToken.token.id;

          const result = calcSingleInGivenPoolOut(pool, inputToken, amountOut);
          return {
            tokenIn,
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
    (tokenInSymbol: string, amountIn: BigNumber) => {
      if (pool) {
        const inputToken =
          pool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];

        if (inputToken) {
          const tokenIn = inputToken.token.id;
          const result = calcPoolOutGivenSingleIn(pool, inputToken, amountIn);

          return {
            tokenIn,
            amountIn,
            ...result,
          };
        }
      }
      return null;
    },
    [pool, tokenLookup]
  );
  const executeMint = useCallback(
    (
      tokenInSymbol: string,
      specifiedField: "from" | "to",
      amount: BigNumber
    ) => {
      if (signer) {
        if (specifiedField === "from") {
          const result = calculateAmountOut(tokenInSymbol, amount);

          if (result && !result.error) {
            joinswapExternAmountIn(
              result.tokenIn,
              result.amountIn,
              downwardSlippage(result.poolAmountOut as BigNumber, SLIPPAGE_RATE)
            );
          } else {
            Promise.reject();
          }
        } else {
          const result = calculateAmountIn(tokenInSymbol, amount);

          if (result && !result.error) {
            joinswapPoolAmountOut(
              result.tokenIn,
              result.amountOut,
              upwardSlippage(result.tokenAmountIn as BigNumber, SLIPPAGE_RATE)
            );
          } else {
            Promise.reject();
          }
        }
      } else {
        return Promise.reject();
      }
    },
    [
      signer,
      calculateAmountIn,
      calculateAmountOut,
      joinswapExternAmountIn,
      joinswapPoolAmountOut,
    ]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  };
}

export function useMultiTokenMintCallbacks(poolId: string) {
  const pool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const joinPool = useMintMultiTransactionCallback(poolId);
  const calculateAmountsIn = useCallback(
    (typedAmountOut: string) => {
      if (pool) {
        const balances = pool.tokensList.map(
          (token) => pool.tokens.entities[token].balance
        );
        const totalSupply = pool.totalSupply;
        const poolAmountOut = convert.toToken(typedAmountOut, 18);

        return {
          tokens: [...pool.tokensList], // Simplify the form's token lookup to convert amounts to strings
          amountsIn: _calcAllInGivenPoolOut(
            balances,
            convert.toBigNumber(totalSupply),
            poolAmountOut
          ),
          poolAmountOut,
        };
      }
    },
    [pool]
  );
  const executeMint = useCallback(
    (typedAmountOut: string) => {
      const result = calculateAmountsIn(typedAmountOut);
      if (result) {
        joinPool(
          result.poolAmountOut,
          result.amountsIn.map((amount) =>
            upwardSlippage(amount, SLIPPAGE_RATE)
          )
        );
      } else {
        Promise.reject();
      }
    },
    [joinPool, calculateAmountsIn]
  );

  return { calculateAmountsIn, executeMint };
}
// #endregion

// #region Routing
export function useMintRouterCallbacks(poolId: string) {
  const poolTokens = usePoolUnderlyingTokens(poolId);
  const poolTokenIds = usePoolTokenAddresses(poolId);
  const tokenLookupBySymbol = useTokenLookupBySymbol();
  const tokenIds = useMemo(
    () => [...poolTokenIds, ...COMMON_BASE_TOKENS.map(({ id }) => id)],
    [poolTokenIds]
  );
  const { mintExactAmountIn, mintExactAmountOut } =
    useRoutedMintTransactionCallbacks(poolId);
  const { calculateAmountIn, calculateAmountOut } =
    useSingleTokenMintCallbacks(poolId);
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
    loading,
  } = useUniswapTradingPairs(tokenIds);
  const getBestMintRouteForAmountOut = useCallback(
    (tokenInSymbol: string, amountOut: BigNumber) => {
      if (loading) return null;
      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const allResults = poolTokens
        .map((token) => {
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];
          if (!normalizedOutput) return null;
          const poolResult = calculateAmountIn(
            normalizedOutput.symbol,
            amountOut
          );
          if (poolResult) {
            if (poolResult.error) {
              return { poolResult };
            }
            if (poolResult.tokenAmountIn) {
              const uniswapResult = calculateBestTradeForExactOutput(
                normalizedInput,
                normalizedOutput,
                poolResult.tokenAmountIn,
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
      loading,
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountIn,
      calculateBestTradeForExactOutput,
    ]
  );
  const getBestMintRouteForAmountIn = useCallback(
    (tokenInSymbol: string, amountIn: BigNumber) => {
      if (loading) return null;

      const normalizedInput = tokenLookupBySymbol[tokenInSymbol.toLowerCase()];
      const allResults = poolTokens
        .map((token) => {
          const normalizedOutput =
            tokenLookupBySymbol[token.token.symbol.toLowerCase()];

          if (!normalizedOutput) return null;

          const uniswapResult = calculateBestTradeForExactInput(
            normalizedInput,
            normalizedOutput,
            amountIn,
            { maxHops: 2, maxNumResults: 1 }
          );

          if (uniswapResult) {
            const poolResult = calculateAmountOut(
              normalizedOutput.symbol,
              convert.toBigNumber(uniswapResult.outputAmount.raw.toString())
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
      loading,
      tokenLookupBySymbol,
      poolTokens,
      calculateAmountOut,
      calculateBestTradeForExactInput,
    ]
  );
  const executeRoutedMint = useCallback(
    (
      tokenInSymbol: string,
      specifiedField: "from" | "to",
      amount: BigNumber
    ) => {
      if (specifiedField === "from") {
        const result = getBestMintRouteForAmountIn(tokenInSymbol, amount);

        if (result && !result.poolResult.error) {
          return mintExactAmountIn(
            convert.toBigNumber(
              result.uniswapResult.inputAmount.raw.toString(10)
            ),
            result.uniswapResult.route.encodedPath,
            downwardSlippage(result.poolResult.poolAmountOut, SLIPPAGE_RATE),
            result.uniswapResult.inputAmount.currency === Currency.ETHER
          );
        }
      } else {
        const result = getBestMintRouteForAmountOut(tokenInSymbol, amount);
        if (result && !result.poolResult.error) {
          return mintExactAmountOut(
            upwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.inputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            ),
            result.uniswapResult.route.encodedPath,
            result.poolResult.amountOut,
            result.uniswapResult.inputAmount.currency === Currency.ETHER
          );
        }
      }
      return Promise.reject();
    },
    [
      getBestMintRouteForAmountOut,
      getBestMintRouteForAmountIn,
      mintExactAmountIn,
      mintExactAmountOut,
    ]
  );

  return {
    tokenIds,
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint,
    loading,
  };
}
// #endregion
