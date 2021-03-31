import { AppState, selectors, thunks } from "features";
import { BigNumber } from "ethereum/utils/balancer-math";
import { SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, ethereumHelpers, upwardSlippage } from "ethereum";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTokenLookupBySymbol } from "features/tokens/hooks";

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
