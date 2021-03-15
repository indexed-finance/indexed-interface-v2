import { AppState, FormattedIndexPool, actions, selectors } from "features";
import { COMMON_BASE_TOKENS, UNISWAP_ROUTER_ADDRESS } from "config";
import { Trade } from "@uniswap/sdk";
import { convert } from "helpers";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTokenUserDataListener } from "features/batcher/hooks";
import { useUniswapTradingPairs } from "hooks";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";

interface Props {
  pool: FormattedIndexPool;
}

export default function TradeInteraction({ pool }: Props) {
  const dispatch = useDispatch();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const tokenIds = useMemo(() => {
    return [pool.id, ...COMMON_BASE_TOKENS.map(({ id }) => id)];
  }, [pool.id]);
  const assets = useSelector((state: AppState) =>
    selectors.selectTokensById(state, tokenIds)
  );
  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);
  const handleChange = useCallback(
    (values: InteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;

      if (!toToken || !fromToken) {
        return;
      }

      const inputToken = tokenLookup[fromToken.toLowerCase()];
      const outputToken = tokenLookup[toToken.toLowerCase()];

      if (lastTouchedField === "from") {
        if (!fromAmount || isNaN(fromAmount)) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }
        const amountIn = convert
          .toToken(fromAmount.toString(), inputToken.decimals)
          .toString(10);
        const bestTrade = calculateBestTradeForExactInput(
          inputToken,
          outputToken,
          amountIn
        );
        values.toAmount = parseFloat(bestTrade?.outputAmount.toFixed(4) ?? "0");
      } else {
        if (!toAmount || isNaN(toAmount)) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }
        const amountOut = convert
          .toToken(toAmount.toString(), outputToken.decimals)
          .toString(10);
        const bestTrade = calculateBestTradeForExactOutput(
          inputToken,
          outputToken,
          amountOut
        );
        values.fromAmount = parseFloat(
          bestTrade?.inputAmount.toFixed(4) ?? "0"
        );
      }
    },
    [
      tokenLookup,
      calculateBestTradeForExactInput,
      calculateBestTradeForExactOutput,
    ]
  );

  const handleSubmit = useCallback(
    ({
      fromToken,
      fromAmount,
      toToken,
      toAmount,
      lastTouchedField,
    }: InteractionValues) => {
      if (fromAmount > 0 && toAmount > 0 && fromToken && toToken) {
        const inputToken = tokenLookup[fromToken.toLowerCase()];
        const outputToken = tokenLookup[toToken.toLowerCase()];
        let trade: Trade | undefined;
        if (lastTouchedField === "from") {
          const amountIn = convert
            .toToken(fromAmount.toString(), inputToken.decimals)
            .toString(10);
          trade = calculateBestTradeForExactInput(
            inputToken,
            outputToken,
            amountIn
          );
        } else {
          const amountOut = convert
            .toToken(toAmount.toString(), outputToken.decimals)
            .toString(10);
          trade = calculateBestTradeForExactOutput(
            inputToken,
            outputToken,
            amountOut
          );
        }
        if (trade) {
          dispatch(actions.trade(trade));
        }
      }
    },
    [
      dispatch,
      tokenLookup,
      calculateBestTradeForExactInput,
      calculateBestTradeForExactOutput,
    ]
  );

  useTokenUserDataListener(UNISWAP_ROUTER_ADDRESS, tokenIds);

  return (
    <BaseInteraction
      title="Trade"
      assets={assets as any}
      spender={UNISWAP_ROUTER_ADDRESS}
      defaultInputSymbol={COMMON_BASE_TOKENS[0].symbol}
      defaultOutputSymbol={pool.symbol}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
}
