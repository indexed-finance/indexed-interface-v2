import { AppState, selectors } from "features";
import { BigNumber } from "ethereum/utils/balancer-math";
import { SLIPPAGE_RATE } from "config";
import {
  calcSwapAmountIn,
  calcSwapAmountOut,
  downwardSlippage,
  upwardSlippage,
} from "ethereum";
import { convert } from "helpers";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useSwapTransactionCallbacks } from "./transaction-hooks";

interface SwapCallbacks {
  calculateAmountIn: (tokenInSymbol: string, tokenOutSymbol: string, typedAmountOut: string) => {
    tokenIn: string;
    tokenOut: string;
    amountOut?: BigNumber;
    error?: string | undefined;
    amountIn?: BigNumber | undefined;
    spotPriceAfter?: BigNumber | undefined;
  } | null;
  calculateAmountOut: (tokenInSymbol: string, tokenOutSymbol: string, typedAmountIn: string) => {
    tokenIn: string;
    tokenOut: string;
    amountOut?: BigNumber;
    error?: string | undefined;
    amountIn?: BigNumber | undefined;
    spotPriceAfter?: BigNumber | undefined;
  } | null;
  executeSwap: (
    tokenInSymbol: string,
    tokenOutSymbol: string,
    specifiedField: "from" | "to",
    typedAmount: string
  ) => void;
}

export function useSwapCallbacks(poolId: string): SwapCallbacks {
  const normalizedPool = useSelector((state: AppState) =>
    selectors.selectPool(state, poolId)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
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
  const { swapExactAmountIn, swapExactAmountOut } = useSwapTransactionCallbacks(
    poolId
  );
  const executeSwap = useCallback(
    (
      tokenInSymbol: string,
      tokenOutSymbol: string,
      specifiedField: "from" | "to",
      typedAmount: string
    ) => {
      if (specifiedField === "from") {
        const result = calculateAmountOut(
          tokenInSymbol,
          tokenOutSymbol,
          typedAmount
        );
        if (result && !result.error) {
          swapExactAmountIn(
            result.tokenIn,
            result.tokenOut,
            result.amountIn,
            downwardSlippage(result.amountOut as BigNumber, SLIPPAGE_RATE),
            upwardSlippage(
              result.spotPriceAfter as BigNumber,
              SLIPPAGE_RATE * 3
            )
          )
        } else {
          throw new Error()
          // Promise.reject();
        }
      } else {
        const result = calculateAmountIn(
          tokenInSymbol,
          tokenOutSymbol,
          typedAmount
        );
        if (result && !result.error) {
          swapExactAmountOut(
            result.tokenIn,
            result.tokenOut,
            upwardSlippage(result.amountIn as BigNumber, SLIPPAGE_RATE),
            result.amountOut,
            upwardSlippage(
              result.spotPriceAfter as BigNumber,
              SLIPPAGE_RATE * 3
            )
          );
        } else {
          throw new Error()
          // Promise.reject();
        }
      }
    },
    [
      calculateAmountIn,
      calculateAmountOut,
      swapExactAmountIn,
      swapExactAmountOut,
    ]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeSwap,
  };
}
