import { AppState, selectors, useProvider } from "features";
import { BigNumber } from "ethereum/utils/balancer-math";
import { SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import {
  downwardSlippage,
  ethereumHelpers,
  swapExactAmountIn,
  swapExactAmountOut,
  upwardSlippage,
} from "ethereum";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export function useSwapCallbacks(poolId: string) {
  const normalizedPool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const [, signer] = useProvider();

  const calculateAmountIn = useCallback(
    (tokenInSymbol: string, tokenOutSymbol: string, typedAmountOut: string) => {
      if (normalizedPool) {
        const inputToken =
          normalizedPool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];
        const outputToken =
          normalizedPool.tokens.entities[
            tokenLookup[tokenOutSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (inputToken && outputToken) {
          const amountOut = convert.toToken(
            typedAmountOut,
            inputToken.token.decimals
          );
          return {
            tokenIn: inputToken.token.id,
            tokenOut: outputToken.token.id,
            amountOut,
            ...ethereumHelpers.calcSwapAmountIn(
              inputToken,
              outputToken,
              amountOut,
              convert.toBigNumber(normalizedPool.swapFee)
            ),
          };
        }
      }
      return null;
    },
    [tokenLookup, normalizedPool]
  );

  const calculateAmountOut = useCallback(
    (tokenInSymbol: string, tokenOutSymbol: string, typedAmountIn: string) => {
      if (normalizedPool) {
        const inputToken =
          normalizedPool.tokens.entities[
            tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
          ];
        const outputToken =
          normalizedPool.tokens.entities[
            tokenLookup[tokenOutSymbol.toLowerCase()].id.toLowerCase()
          ];
        if (inputToken && outputToken) {
          const amountIn = convert.toToken(
            typedAmountIn,
            inputToken.token.decimals
          );
          return {
            tokenIn: inputToken.token.id,
            tokenOut: outputToken.token.id,
            amountIn,
            ...ethereumHelpers.calcSwapAmountOut(
              inputToken,
              outputToken,
              amountIn,
              convert.toBigNumber(normalizedPool.swapFee)
            ),
          };
        }
      }
      return null;
    },
    [tokenLookup, normalizedPool]
  );

  const executeSwap = useCallback(
    (
      tokenInSymbol: string,
      tokenOutSymbol: string,
      specifiedField: "from" | "to",
      typedAmount: string
    ) => {
      if (signer) {
        if (specifiedField === "from") {
          const result = calculateAmountOut(
            tokenInSymbol,
            tokenOutSymbol,
            typedAmount
          );

          if (result) {
            if (result.error) {
              return Promise.reject(
                `Caught error calculating swap values: ${result.error}`
              );
            }

            /* Do execute */
            const maxPrice = upwardSlippage(
              result.spotPriceAfter as BigNumber,
              SLIPPAGE_RATE * 3
            );
            const minAmountOut = downwardSlippage(
              result.amountOut as BigNumber,
              SLIPPAGE_RATE
            );

            return swapExactAmountIn(
              signer as any,
              poolId,
              result.tokenIn,
              result.tokenOut,
              result.amountIn,
              minAmountOut,
              maxPrice
            );
          } else {
            return Promise.reject("Caught error calculating swap values.");
          }
        } else {
          const result = calculateAmountIn(
            tokenInSymbol,
            tokenOutSymbol,
            typedAmount
          );

          if (result) {
            if (result.error) {
              return Promise.reject(
                `Caught error calculating swap values: ${result.error}`
              );
            }

            /* Do execute */
            const maxPrice = upwardSlippage(
              result.spotPriceAfter as BigNumber,
              SLIPPAGE_RATE * 3
            );
            const maxAmountIn = upwardSlippage(
              result.amountIn as BigNumber,
              SLIPPAGE_RATE
            );

            return swapExactAmountOut(
              signer as any,
              poolId,
              result.tokenIn,
              result.tokenOut,
              maxAmountIn,
              result.amountOut,
              maxPrice
            );
          } else {
            return Promise.reject("Caught error calculating swap values.");
          }
        }
      } else {
        return Promise.reject();
      }
    },
    [signer, calculateAmountIn, calculateAmountOut, poolId]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeSwap,
  };
}
