import {
  DISPLAYED_COMMON_BASE_TOKENS,
  NARWHAL_ROUTER_ADDRESS,
  SLIPPAGE_RATE,
} from "config";
import { FormattedIndexPool, selectors } from "features";
import {
  MultiInteraction,
  MultiInteractionValues,
  SingleInteraction,
  SingleInteractionValues,
} from "./BaseInteraction";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import {
  useBalanceAndApprovalRegistrar,
  useBalancesRegistrar,
  useBurnRouterCallbacks,
  useMultiTokenBurnCallbacks,
  useSingleTokenBurnCallbacks,
} from "hooks";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";

interface Props {
  indexPool: FormattedIndexPool;
  uniswap?: boolean;
  multi?: boolean;
}

const DEFAULT_ENTRY = {
  displayed: "0.00",
  exact: convert.toBigNumber("0.00"),
};

export function BurnInteraction({ indexPool, uniswap, multi }: Props) {
  if (uniswap) {
    return <UniswapBurnInteraction indexPool={indexPool} />;
  } else if (multi) {
    return <MultiTokenBurnInteraction indexPool={indexPool} />;
  } else {
    return <SingleTokenBurnInteraction indexPool={indexPool} />;
  }
}

function SingleTokenBurnInteraction({ indexPool }: Props) {
  const poolId = indexPool.id;
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeBurn,
  } = useSingleTokenBurnCallbacks(poolId);

  useBalancesRegistrar([poolId]);

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
      if (lastTouchedField === "from") {
        if (!fromAmount || fromAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }

        const output = calculateAmountOut(toToken, fromAmount.exact);

        if (output) {
          if (output.error) {
            return output.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const asBigNumber = downwardSlippage(
              output.tokenAmountOut as BigNumber,
              SLIPPAGE_RATE
            );

            values.toAmount = {
              displayed: convert.toBalance(asBigNumber, decimals),
              exact: asBigNumber,
            };
          }
        }
      } else {
        if (!toAmount || toAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }

        const input = calculateAmountIn(toToken, toAmount.exact);

        if (input) {
          if (input.error) {
            return input.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            const asBigNumber = upwardSlippage(
              input.poolAmountIn as BigNumber,
              SLIPPAGE_RATE
            );

            values.fromAmount = {
              displayed: convert.toBalance(asBigNumber, decimals),
              exact: asBigNumber,
            };
          }
        }
      }
    },
    [calculateAmountIn, calculateAmountOut, tokenLookup]
  );

  const handleSubmit = useCallback(
    (values: SingleInteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;
      if (
        fromAmount.exact.isGreaterThan(0) &&
        toAmount.exact.isGreaterThan(0) &&
        fromToken &&
        toToken
      ) {
        executeBurn(
          toToken,
          lastTouchedField,
          lastTouchedField === "from" ? fromAmount.exact : toAmount.exact
        );
      }
    },
    [executeBurn]
  );

  return (
    <SingleInteraction
      assets={indexPool.assets}
      spender={poolId}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={indexPool.symbol}
      disableInputSelect={true}
      requiresApproval={false}
    />
  );
}

function MultiTokenBurnInteraction({ indexPool }: Props) {
  const { executeBurn } = useMultiTokenBurnCallbacks(indexPool.id);
  const handleSubmit = useCallback(
    (values: MultiInteractionValues) =>
      executeBurn(values.fromAmount.displayed),
    [executeBurn]
  );

  return (
    <MultiInteraction
      isInput={true}
      assets={indexPool.assets}
      spender={indexPool.id}
      onSubmit={handleSubmit}
      requiresApproval={false}
      kind="burn"
    />
  );
}

function UniswapBurnInteraction({ indexPool }: Props) {
  const poolId = indexPool.id;
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    getBestBurnRouteForAmountIn,
    getBestBurnRouteForAmountOut,
    executeRoutedBurn,
  } = useBurnRouterCallbacks(poolId);

  const assets = [
    ...DISPLAYED_COMMON_BASE_TOKENS,
    { id: indexPool.id, name: indexPool.name, symbol: indexPool.symbol },
  ];

  useBalanceAndApprovalRegistrar(NARWHAL_ROUTER_ADDRESS.toLowerCase(), [
    poolId,
  ]);

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
      if (lastTouchedField === "from") {
        if (!fromAmount || fromAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }
        const result = getBestBurnRouteForAmountIn(toToken, fromAmount.exact);
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const asBigNumber = downwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.outputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            );

            values.toAmount = {
              displayed: convert.toBalance(asBigNumber, decimals),
              exact: asBigNumber,
            };
          }
        }
      } else {
        if (!toAmount || toAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }

        const result = getBestBurnRouteForAmountOut(toToken, toAmount.exact);

        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const asBigNumber = upwardSlippage(
              result.poolResult.poolAmountIn,
              SLIPPAGE_RATE
            );

            values.fromAmount = {
              displayed: convert.toBalance(asBigNumber, decimals),
              exact: asBigNumber,
            };
          }
        }
      }
    },
    [getBestBurnRouteForAmountIn, getBestBurnRouteForAmountOut, tokenLookup]
  );

  const handleSubmit = useCallback(
    (values: SingleInteractionValues) => {
      const {
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        lastTouchedField,
      } = values;

      if (
        fromAmount.exact.isGreaterThan(0) &&
        toAmount.exact.isGreaterThan(0) &&
        fromToken &&
        toToken
      ) {
        executeRoutedBurn(
          toToken,
          lastTouchedField,
          lastTouchedField === "from" ? fromAmount.exact : toAmount.exact
        );
      }
    },
    [executeRoutedBurn]
  );

  return (
    <SingleInteraction
      assets={
        assets.filter((_) => _) as {
          name: string;
          symbol: string;
          id: string;
        }[]
      }
      spender={NARWHAL_ROUTER_ADDRESS.toLowerCase()}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={indexPool.symbol}
      defaultOutputSymbol={assets[0].symbol}
      disableInputSelect
    />
  );
}
