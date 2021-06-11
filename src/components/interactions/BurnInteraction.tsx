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
        if (!fromAmount || isNaN(fromAmount) || fromAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }
        const output = calculateAmountOut(toToken, fromAmount.toString());
        if (output) {
          if (output.error) {
            return output.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            values.toAmount = parseFloat(
              convert.toBalance(
                downwardSlippage(
                  output.tokenAmountOut as BigNumber,
                  SLIPPAGE_RATE
                ),
                decimals
              )
            );
          }
        }
      } else {
        if (!toAmount || isNaN(toAmount) || toAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }

        const input = calculateAmountIn(toToken, toAmount.toString());
        if (input) {
          if (input.error) {
            return input.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            values.fromAmount = parseFloat(
              convert.toBalance(
                upwardSlippage(input.poolAmountIn as BigNumber, SLIPPAGE_RATE),
                decimals
              )
            );
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
      if (fromAmount > 0 && toAmount > 0 && fromToken && toToken) {
        executeBurn(
          toToken,
          lastTouchedField,
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
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
      disableInputSelect
      requiresApproval={false}
    />
  );
}

function MultiTokenBurnInteraction({ indexPool }: Props) {
  const { executeBurn } = useMultiTokenBurnCallbacks(indexPool.id);
  const handleSubmit = useCallback(
    (values: MultiInteractionValues) =>
      executeBurn(values.fromAmount.toString()),
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

  const assets = [...DISPLAYED_COMMON_BASE_TOKENS, {id: indexPool.id, name: indexPool.name, symbol: indexPool.symbol}];

  useBalanceAndApprovalRegistrar(NARWHAL_ROUTER_ADDRESS.toLowerCase(), [poolId]);

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
        if (!fromAmount || isNaN(fromAmount) || fromAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }
        const result = getBestBurnRouteForAmountIn(
          toToken,
          fromAmount.toString()
        );
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];
            values.toAmount = parseFloat(
              convert.toBalance(
                downwardSlippage(
                  convert.toBigNumber(
                    result.uniswapResult.outputAmount.raw.toString(10)
                  ),
                  SLIPPAGE_RATE
                ),
                decimals
              )
            );
          }
        }
      } else {
        if (!toAmount || isNaN(toAmount) || toAmount < 0) {
          values.fromAmount = 0;
          values.toAmount = 0;
          return;
        }

        const result = getBestBurnRouteForAmountOut(
          toToken,
          toAmount.toString()
        );
        if (result) {
          if (result.poolResult?.error) {
            return result.poolResult.error;
          } else {
            values.fromAmount = parseFloat(
              convert.toBalance(
                upwardSlippage(result.poolResult.poolAmountIn, SLIPPAGE_RATE),
                18
              )
            );
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

      if (fromAmount > 0 && toAmount > 0 && fromToken && toToken) {
        executeRoutedBurn(
          toToken,
          lastTouchedField,
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
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
