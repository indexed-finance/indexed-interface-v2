import { AppState, selectors, thunks } from "features";
import { BigNumber } from "ethereum/utils/balancer-math";
import { SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, ethereumHelpers, upwardSlippage } from "ethereum";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useSwapCallbacks(poolId: string) {
  const dispatch = useDispatch();
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
      if (specifiedField === "from") {
        const result = calculateAmountOut(
          tokenInSymbol,
          tokenOutSymbol,
          typedAmount
        );
        if (!result) throw Error(`Caught error calculating swap values.`);
        if (result.error)
          throw Error(`Caught error calculating swap values: ${result.error}`);
        /* Do execute */
        const maxPrice = upwardSlippage(
          result.spotPriceAfter as BigNumber,
          SLIPPAGE_RATE * 3
        );
        const minAmountOut = downwardSlippage(
          result.amountOut as BigNumber,
          SLIPPAGE_RATE
        );
        dispatch(
          thunks.swapExactAmountIn(
            poolId,
            result.tokenIn,
            result.amountIn,
            result.tokenOut,
            minAmountOut,
            maxPrice
          )
        );
      } else {
        const result = calculateAmountIn(
          tokenInSymbol,
          tokenOutSymbol,
          typedAmount
        );
        if (!result) throw Error(`Caught error calculating swap values.`);
        if (result.error)
          throw Error(`Caught error calculating swap values: ${result.error}`);
        /* Do execute */
        const maxPrice = upwardSlippage(
          result.spotPriceAfter as BigNumber,
          SLIPPAGE_RATE * 3
        );
        const maxAmountIn = upwardSlippage(
          result.amountIn as BigNumber,
          SLIPPAGE_RATE
        );
        dispatch(
          thunks.swapExactAmountOut(
            poolId,
            result.tokenIn,
            maxAmountIn,
            result.tokenOut,
            result.amountOut,
            maxPrice
          )
        );
      }
    },
    [calculateAmountIn, calculateAmountOut, poolId, dispatch]
  );

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeSwap,
  };
}
