import { AppState, FormattedIndexPool, selectors } from "features";
import { DISPLAYED_COMMON_BASE_TOKENS, NARWHAL_ROUTER_ADDRESS } from "config";
import { SingleInteraction, SingleInteractionValues } from "./BaseInteraction";
import { convert } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useDisplayedCommonBaseTokens,
  useUniswapTradingPairs,
  useUniswapTransactionCallback,
} from "hooks";
import { useCallback, useMemo } from "react";
import { useIndexedNarwhalRouterAddress } from "hooks/address-hooks";
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
  const baseTokens = useDisplayedCommonBaseTokens()
  const narwhalRouterAddress = useIndexedNarwhalRouterAddress()
  const tokenIds = useMemo(
    () => [indexPool.id, ...baseTokens.map(({ id }) => id)],
    [indexPool.id, baseTokens]
  );
  const assets = useSelector((state: AppState) =>
    selectors.selectTokensById(state, tokenIds)
  );
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
          const bestTrade = calculateBestTradeForExactInput(
            inputToken,
            outputToken,
            fromAmount.exact
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
          const bestTrade = calculateBestTradeForExactOutput(
            inputToken,
            outputToken,
            toAmount.exact
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
        const tradeFn =
          lastTouchedField === "from"
            ? calculateBestTradeForExactInput
            : calculateBestTradeForExactOutput;
        const trade = tradeFn(inputToken, outputToken, fromAmount.exact);

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

  useBalanceAndApprovalRegistrar(narwhalRouterAddress, tokenIds);

  return (
    <SingleInteraction
      assets={assets as any}
      spender={narwhalRouterAddress}
      defaultInputSymbol={baseTokens[0].symbol}
      defaultOutputSymbol={indexPool.symbol}
      onSubmit={handleSubmit}
      onChange={handleChange}
    />
  );
}
