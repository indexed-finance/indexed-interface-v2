import { AppState, selectors, thunks } from "features";
import { BigNumber, calcAllInGivenPoolOut } from "ethereum/utils/balancer-math";
import { SLIPPAGE_RATE } from "config";
import { 
  calcPoolOutGivenSingleIn,
  calcSingleInGivenPoolOut,
  downwardSlippage,
  upwardSlippage
} from "ethereum/helpers";
import { convert } from "helpers";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useSingleTokenMintCallbacks(poolId: string) {
  const dispatch = useDispatch();
  const pool = useSelector((state: AppState) => selectors.selectPool(state, poolId));
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  const calculateAmountIn = useCallback(
    (tokenInSymbol: string, typedAmountOut: string) => {
      if (pool) {
        const inputToken = pool.tokens.entities[
          tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
        ];
        if (inputToken) {
          const amountOut = convert.toToken(typedAmountOut, 18);
          const tokenIn = inputToken.token.id;
          const result = calcSingleInGivenPoolOut(pool, inputToken, amountOut);
          return {
            tokenIn,
            amountOut,
            ...result
          };
        }
      }
      return null;
    }, [pool, tokenLookup]
  );

  const calculateAmountOut = useCallback(
    (tokenInSymbol: string, typedAmountIn: string) => {
      if (pool) {
        const inputToken = pool.tokens.entities[
          tokenLookup[tokenInSymbol.toLowerCase()].id.toLowerCase()
        ];
        if (inputToken) {
          const amountIn = convert.toToken(typedAmountIn, 18);
          const tokenIn = inputToken.token.id;
          const result = calcPoolOutGivenSingleIn(pool, inputToken, amountIn);
          return {
            tokenIn,
            amountIn,
            ...result
          };
        }
      }
      return null;
    }, [pool, tokenLookup]
  );

  const executeMint = useCallback((
    tokenInSymbol: string,
    specifiedField: "from" | "to",
    typedAmount: string
  ) => {
    if (specifiedField === "from") {
      const result = calculateAmountOut(tokenInSymbol, typedAmount);
      if (!result) throw Error(`Caught error calculating mint output.`);
      if (result.error) throw Error(`Caught error calculating mint output: ${result.error}`);
      const minPoolAmountOut = downwardSlippage(result.poolAmountOut as BigNumber, SLIPPAGE_RATE);
      dispatch(
        thunks.joinswapExternAmountIn(
          poolId,
          result.tokenIn,
          result.amountIn,
          minPoolAmountOut
        )
      );
    } else {
      const result = calculateAmountIn(tokenInSymbol, typedAmount);
      if (!result) throw Error(`Caught error calculating mint input.`);
      if (result.error) throw Error(`Caught error calculating mint input: ${result.error}`);
      const maxAmountIn = upwardSlippage(result.tokenAmountIn as BigNumber, SLIPPAGE_RATE);
      dispatch(
        thunks.joinswapPoolAmountOut(
          poolId,
          result.tokenIn,
          result.amountOut,
          maxAmountIn
        )
      );
    }
  }, [dispatch, calculateAmountIn, calculateAmountOut, poolId]);

  return {
    calculateAmountIn,
    calculateAmountOut,
    executeMint
  };
}

export function useMultiTokenMintCallbacks(poolId: string) {
  const dispatch = useDispatch();
  const pool = useSelector((state: AppState) => selectors.selectPool(state, poolId));

  const calculateAmountsIn = useCallback(
    (typedAmountOut: string) => {
      if (pool) {
        const balances = pool.tokensList.map((token) => pool.tokens.entities[token].balance);
        const totalSupply = pool.totalSupply;
        const poolAmountOut = convert.toToken(typedAmountOut, 18);
        return {
          tokens: [...pool.tokensList], // Simplify the form's token lookup to convert amounts to strings
          amountsIn: calcAllInGivenPoolOut(balances, convert.toBigNumber(totalSupply), poolAmountOut),
          poolAmountOut
        };
      }
    }, [pool]
  );

  const executeMint = useCallback(
    (typedAmountOut: string) => {
      const result = calculateAmountsIn(typedAmountOut);
      if (!result) throw Error(`Caught error calculating mint inputs.`);
      const { amountsIn, poolAmountOut } = result;
      const maxAmountsIn = amountsIn.map((amount) => upwardSlippage(amount, SLIPPAGE_RATE));
      dispatch(
        thunks.joinPool(poolId, poolAmountOut, maxAmountsIn)
      )
    },
    []
  )

  return { calculateAmountsIn, executeMint }
}