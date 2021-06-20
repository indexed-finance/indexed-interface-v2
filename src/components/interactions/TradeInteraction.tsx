import { AppState, FormattedIndexPool, selectors } from "features";
import { DISPLAYED_COMMON_BASE_TOKENS, NARWHAL_ROUTER_ADDRESS } from "config";
import { SingleInteraction, SingleInteractionValues } from "./BaseInteraction";
import { Trade } from "@indexed-finance/narwhal-sdk";
import { convert } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useUniswapTradingPairs,
  useUniswapTransactionCallback,
} from "hooks";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

interface Props {
  indexPool: FormattedIndexPool;
}

const DEFAULT_ENTRY = {
  displayed: "0.00",
  exact: convert.toBigNumber("0.00"),
};

export function TradeInteraction({ indexPool }: Props) {
  const handleTrade = useUniswapTransactionCallback();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const tokenIds = useMemo(
    () => [indexPool.id, ...DISPLAYED_COMMON_BASE_TOKENS.map(({ id }) => id)],
    [indexPool.id]
  );
  const assets = useSelector((state: AppState) =>
    selectors.selectTokensById(state, tokenIds)
  );

  useBalanceAndApprovalRegistrar(NARWHAL_ROUTER_ADDRESS, tokenIds);

  const {
    calculateBestTradeForExactInput,
    calculateBestTradeForExactOutput,
  } = useUniswapTradingPairs(tokenIds);

  const handleChange = useCallback(
    (values: SingleInteractionValues) => {
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
      if (inputToken && outputToken) {
        if (lastTouchedField === "from") {
          if (!fromAmount) {
            values.fromAmount = DEFAULT_ENTRY;
            values.toAmount = DEFAULT_ENTRY;

            return;
          }
          const amountIn = convert
            .toToken(fromAmount.displayed, inputToken.decimals)
            .toString(10);
          const bestTrade = calculateBestTradeForExactInput(
            inputToken,
            outputToken,
            amountIn
          );
          const innerResult = bestTrade?.outputAmount.toFixed(4) ?? "0.00";

          values.toAmount = {
            displayed: innerResult,
            exact: convert.toBigNumber(innerResult),
          };
        } else {
          if (!toAmount) {
            values.fromAmount = DEFAULT_ENTRY;
            values.toAmount = DEFAULT_ENTRY;

            return;
          }
          const amountOut = convert
            .toToken(toAmount.displayed, outputToken.decimals)
            .toString(10);
          const bestTrade = calculateBestTradeForExactOutput(
            inputToken,
            outputToken,
            amountOut
          );
          const innerResult = bestTrade?.inputAmount.toFixed(4) ?? "0.00";

          values.fromAmount = {
            displayed: innerResult,
            exact: convert.toBigNumber(innerResult),
          };
        }
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
    }: SingleInteractionValues) => {
      if (
        fromAmount.exact.isGreaterThan(0) &&
        toAmount.exact.isGreaterThan(0) &&
        fromToken &&
        toToken
      ) {
        const inputToken = tokenLookup[fromToken.toLowerCase()];
        const outputToken = tokenLookup[toToken.toLowerCase()];
        let trade: Trade | undefined;
        if (lastTouchedField === "from") {
          const amountIn = convert
            .toToken(fromAmount.displayed, inputToken.decimals)
            .toString(10);

          trade = calculateBestTradeForExactInput(
            inputToken,
            outputToken,
            amountIn
          );
        } else {
          const amountOut = convert
            .toToken(toAmount.displayed, outputToken.decimals)
            .toString(10);

          trade = calculateBestTradeForExactOutput(
            inputToken,
            outputToken,
            amountOut
          );
        }
        if (trade) {
          handleTrade(trade);
        }
      }
    },
    [
      tokenLookup,
      calculateBestTradeForExactInput,
      calculateBestTradeForExactOutput,
      handleTrade,
    ]
  );

  return (
    <SingleInteraction
      assets={assets as any}
      spender={NARWHAL_ROUTER_ADDRESS}
      defaultInputSymbol={DISPLAYED_COMMON_BASE_TOKENS[0].symbol}
      defaultOutputSymbol={indexPool.symbol}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
}
