import { AppState, selectors, useSigner } from "features";
import { BigNumber } from "ethereum/utils/balancer-math";
import { SLIPPAGE_RATE } from "config";
import {
  calcSwapAmountIn,
  calcSwapAmountOut,
  downwardSlippage,
  swapExactAmountIn,
  swapExactAmountOut,
  upwardSlippage,
} from "ethereum";
import { convert } from "helpers";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export function useSwapCallbacks(poolId: string) {
  const normalizedPool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const signer = useSigner();
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
            ...calcSwapAmountIn(
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
            ...calcSwapAmountOut(
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

          return result && !result.error
            ? swapExactAmountIn(
                signer as any,
                poolId,
                result.tokenIn,
                result.tokenOut,
                result.amountIn,
                downwardSlippage(result.amountOut as BigNumber, SLIPPAGE_RATE),
                upwardSlippage(
                  result.spotPriceAfter as BigNumber,
                  SLIPPAGE_RATE * 3
                )
              )
            : Promise.reject();
        } else {
          const result = calculateAmountIn(
            tokenInSymbol,
            tokenOutSymbol,
            typedAmount
          );

          return result && !result.error
            ? swapExactAmountOut(
                signer as any,
                poolId,
                result.tokenIn,
                result.tokenOut,
                upwardSlippage(result.amountIn as BigNumber, SLIPPAGE_RATE),
                result.amountOut,
                upwardSlippage(
                  result.spotPriceAfter as BigNumber,
                  SLIPPAGE_RATE * 3
                )
              )
            : Promise.reject();
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
