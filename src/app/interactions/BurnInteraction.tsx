import { BURN_ROUTER_ADDRESS, COMMON_BASE_TOKENS, SLIPPAGE_RATE } from "config";
import {
  FormattedIndexPool,
  actions,
  selectors,
  usePoolToTokens,
  useUserDataRegistrar,
} from "features";
import { Fragment, useCallback, useState } from "react";
import { Radio } from "antd";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { useSelector } from "react-redux";
import { useSingleTokenBurnCallbacks } from "hooks/use-burn-callbacks";
import { useTranslation } from "i18n";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";
import BigNumber from "bignumber.js";
import useBurnRouterCallbacks from "hooks/use-burn-router-callbacks";

interface Props {
  pool: FormattedIndexPool;
}

export default function BurnInteraction({ pool }: Props) {
  const [burnType, setBurnType] = useState<"single" | "uniswap" | "multi">(
    "single"
  );
  const poolsToTokens = usePoolToTokens(pool);

  useUserDataRegistrar(poolsToTokens, actions, selectors);

  return (
    <Fragment>
      <Radio.Group
        value={burnType}
        onChange={({ target: { value } }) => {
          setBurnType(value);
        }}
      >
        <Radio.Button value="single">Single Output</Radio.Button>
        <Radio.Button value="multi">Multi Output</Radio.Button>
        <Radio.Button value="uniswap">Uniswap</Radio.Button>
      </Radio.Group>
      {burnType === "single" && <SingleTokenBurnInteraction pool={pool} />}
      {burnType === "uniswap" && <UniswapBurnInteraction pool={pool} />}
    </Fragment>
  );
}

function SingleTokenBurnInteraction({ pool }: Props) {
  const tx = useTranslation();
  const poolId = pool.id;
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const poolsToTokens = usePoolToTokens(pool);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeBurn,
  } = useSingleTokenBurnCallbacks(poolId);

  useUserDataRegistrar(poolsToTokens, actions, selectors);

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
    (values: InteractionValues) => {
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
    <BaseInteraction
      title={tx("BURN")}
      assets={pool.assets}
      spender={poolId}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={pool.symbol}
      disableInputSelect
      requiresApproval={false}
    />
  );
}

function UniswapBurnInteraction({ pool }: Props) {
  const tx = useTranslation();
  const poolId = pool.id;
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const poolsToTokens = usePoolToTokens(pool);
  const {
    getBestBurnRouteForAmountIn,
    getBestBurnRouteForAmountOut,
    executeRoutedBurn,
  } = useBurnRouterCallbacks(poolId);

  const assets = [...COMMON_BASE_TOKENS];

  useUserDataRegistrar(poolsToTokens, actions, selectors);

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
    (values: InteractionValues) => {
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
    <BaseInteraction
      title={tx("BURN_WITH_UNISWAP")}
      assets={
        assets.filter((_) => _) as {
          name: string;
          symbol: string;
          id: string;
        }[]
      }
      spender={BURN_ROUTER_ADDRESS}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={pool.symbol}
      defaultOutputSymbol={assets[0].symbol}
      disableInputSelect
    />
  );
}
