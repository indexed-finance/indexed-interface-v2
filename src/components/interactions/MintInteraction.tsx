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
  useMintRouterCallbacks,
  useMultiTokenMintCallbacks,
  usePoolTokenAddresses,
  useSingleTokenMintCallbacks,
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

export function MintInteraction({ indexPool, uniswap, multi }: Props) {
  if (uniswap) {
    return <UniswapMintInteraction indexPool={indexPool} />;
  } else if (multi) {
    return <MultiTokenMintInteraction indexPool={indexPool} />;
  } else {
    return <SingleTokenMintInteraction indexPool={indexPool} />;
  }
}

function SingleTokenMintInteraction({ indexPool }: Props) {
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeMint,
  } = useSingleTokenMintCallbacks(indexPool.id);
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
        // Reset both values.
        if (!fromAmount || fromAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }

        const output = calculateAmountOut(fromToken, fromAmount.exact);

        if (output) {
          if (output.error) {
            return output.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const asBigNumber = downwardSlippage(
              output.poolAmountOut as BigNumber,
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

        const input = calculateAmountIn(fromToken, toAmount.exact);

        if (input) {
          if (input.error) {
            return input.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            const asBigNumber = upwardSlippage(
              input.tokenAmountIn as BigNumber,
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
        executeMint(
          fromToken,
          lastTouchedField,
          lastTouchedField === "from" ? fromAmount.exact : toAmount.exact
        );
      }
    },
    [executeMint]
  );
  const tokenIds = usePoolTokenAddresses(indexPool.id);

  useBalanceAndApprovalRegistrar(indexPool.id, tokenIds);

  return (
    <SingleInteraction
      assets={indexPool.assets}
      spender={indexPool.id}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultOutputSymbol={indexPool.symbol}
      disableOutputSelect
    />
  );
}

function UniswapMintInteraction({ indexPool }: Props) {
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const assets = [...DISPLAYED_COMMON_BASE_TOKENS];
  const {
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint,
    loading,
  } = useMintRouterCallbacks(indexPool.id);
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
        // AMOUNT IN.

        if (!fromAmount || fromAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }

        const result = getBestMintRouteForAmountIn(fromToken, fromAmount.exact);

        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const asBigNumber = downwardSlippage(
              result.poolResult.poolAmountOut as BigNumber,
              SLIPPAGE_RATE
            );

            values.toAmount = {
              displayed: convert.toBalance(asBigNumber, decimals),
              exact: asBigNumber,
            };
          }
        } else {
          values.toAmount = DEFAULT_ENTRY;
        }
      } else {
        // AMOUNT OUT.
        if (!toAmount || toAmount.exact.isLessThan(0)) {
          values.fromAmount = DEFAULT_ENTRY;
          values.toAmount = DEFAULT_ENTRY;

          return;
        }

        const result = getBestMintRouteForAmountOut(fromToken, toAmount.exact);

        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            const asBigNumber = upwardSlippage(
              convert.toBigNumber(
                result.uniswapResult.inputAmount.raw.toString(10)
              ),
              SLIPPAGE_RATE
            );

            values.fromAmount = {
              displayed: convert.toBalance(asBigNumber, decimals),
              exact: asBigNumber,
            };
          }
        } else {
          values.fromAmount = DEFAULT_ENTRY;
        }
      }
    },
    [getBestMintRouteForAmountIn, getBestMintRouteForAmountOut, tokenLookup]
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
        executeRoutedMint(
          fromToken,
          lastTouchedField,
          lastTouchedField === "from" ? fromAmount.exact : toAmount.exact
        );
      }
    },
    [executeRoutedMint]
  );

  useBalanceAndApprovalRegistrar(NARWHAL_ROUTER_ADDRESS.toLowerCase(), [
    ...DISPLAYED_COMMON_BASE_TOKENS.map(({ id }) => id),
  ]);

  return (
    <SingleInteraction
      assets={
        assets.filter((_) => _) as {
          name: string;
          symbol: string;
          id: string;
        }[]
      }
      loading={loading}
      spender={NARWHAL_ROUTER_ADDRESS}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={assets[0].symbol}
      defaultOutputSymbol={indexPool.symbol}
      disableOutputSelect
    />
  );
}

function MultiTokenMintInteraction({ indexPool }: Props) {
  const { executeMint } = useMultiTokenMintCallbacks(indexPool.id);
  const handleSubmit = useCallback(
    (values: MultiInteractionValues) =>
      executeMint(values.fromAmount.displayed),
    [executeMint]
  );
  const tokenIds = usePoolTokenAddresses(indexPool.id);

  useBalanceAndApprovalRegistrar(indexPool.id, tokenIds);

  return (
    <MultiInteraction
      assets={indexPool.assets}
      spender={indexPool.id}
      onSubmit={handleSubmit}
      requiresApproval={false}
      kind="mint"
    />
  );
}
