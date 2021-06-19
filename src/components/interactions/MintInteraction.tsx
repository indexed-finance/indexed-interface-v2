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
        if (!fromAmount || fromAmount.exact.isLessThan(0)) {
          values.fromAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          values.toAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          return;
        }
        const output = calculateAmountOut(fromToken, fromAmount.toString());
        if (output) {
          if (output.error) {
            return output.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const innerResult = convert.toBalance(
              downwardSlippage(
                output.poolAmountOut as BigNumber,
                SLIPPAGE_RATE
              ),
              decimals
            );
            values.toAmount = {
              displayed: innerResult,
              exact: convert.toBigNumber(innerResult),
            };
          }
        }
      } else {
        if (!toAmount || toAmount.exact.isLessThan(0)) {
          values.fromAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          values.toAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          return;
        }

        const input = calculateAmountIn(fromToken, toAmount.toString());
        if (input) {
          if (input.error) {
            return input.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            const innerResult = convert.toBalance(
              upwardSlippage(input.tokenAmountIn as BigNumber, SLIPPAGE_RATE),
              decimals
            );

            values.fromAmount = {
              displayed: innerResult,
              exact: convert.toBigNumber(innerResult),
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
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
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

  useBalanceAndApprovalRegistrar(NARWHAL_ROUTER_ADDRESS.toLowerCase(), [
    ...DISPLAYED_COMMON_BASE_TOKENS.map(({ id }) => id),
  ]);
  const {
    getBestMintRouteForAmountIn,
    getBestMintRouteForAmountOut,
    executeRoutedMint,
    loading,
  } = useMintRouterCallbacks(indexPool.id);

  const assets = [...DISPLAYED_COMMON_BASE_TOKENS];

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
          values.fromAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          values.toAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          return;
        }
        const result = getBestMintRouteForAmountIn(
          fromToken,
          fromAmount.toString()
        );
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            const innerResult = convert.toBalance(
              downwardSlippage(
                result.poolResult.poolAmountOut as BigNumber,
                SLIPPAGE_RATE
              ),
              decimals
            );

            values.toAmount = {
              displayed: innerResult,
              exact: convert.toBigNumber(innerResult),
            };
          }
        } else {
          values.toAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
        }
      } else {
        if (!toAmount || toAmount.exact.isLessThan(0)) {
          values.fromAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          values.toAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
          return;
        }

        const result = getBestMintRouteForAmountOut(
          fromToken,
          toAmount.toString()
        );
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            const innerResult = convert.toBalance(
              upwardSlippage(
                convert.toBigNumber(
                  result.uniswapResult.inputAmount.raw.toString(10)
                ),
                SLIPPAGE_RATE
              ),
              decimals
            );

            values.fromAmount = {
              displayed: innerResult,
              exact: convert.toBigNumber(innerResult),
            };
          }
        } else {
          values.fromAmount = {
            displayed: "0.00",
            exact: convert.toBigNumber("0.00"),
          };
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
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
        );
      }
    },
    [executeRoutedMint]
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

  const tokenIds = usePoolTokenAddresses(indexPool.id);
  useBalanceAndApprovalRegistrar(indexPool.id, tokenIds);

  const handleSubmit = useCallback(
    (values: MultiInteractionValues) =>
      executeMint(values.fromAmount.toString()),
    [executeMint]
  );

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
