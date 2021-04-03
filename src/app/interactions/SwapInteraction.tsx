import { AppState, FormattedIndexPool, selectors } from "features";
import { BaseInteraction, InteractionValues } from "./BaseInteraction";
import { BigNumber } from "ethereum/utils/balancer-math";
import { Divider, Space } from "antd";
import { FEATURE_FLAGS } from "feature-flags";
import { PlainLanguageTransaction, TokenExchangeRate } from "components";
import { SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { ethereumHelpers } from "ethereum";
import { getSwapCost } from "ethereum/utils";
import { useCallback, useMemo } from "react";
import { useFormikContext } from "formik";
import { usePoolToTokens, useSwapCallbacks, useUserDataRegistrar } from "hooks";
import { useSelector } from "react-redux";
import { useTransactionNotification, useTranslator } from "hooks";

interface Props {
  pool: FormattedIndexPool;
}

export default function SwapInteraction({ pool }: Props) {
  const tx = useTranslator();
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeSwap,
  } = useSwapCallbacks(pool.id);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const poolToTokens = usePoolToTokens(pool);
  const { sendTransaction } = useTransactionNotification({
    successMessage: "TODO: Swap Succeed",
    errorMessage: "TODO: Swap Fail",
  });
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
        const output = calculateAmountOut(
          fromToken,
          toToken,
          fromAmount.toString()
        );
        if (output) {
          if (output.error) {
            return output.error;
          } else {
            const { decimals } = tokenLookup[toToken.toLowerCase()];

            values.toAmount = parseFloat(
              convert.toBalance(
                downwardSlippage(output.amountOut as BigNumber, SLIPPAGE_RATE),
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
        const input = calculateAmountIn(
          fromToken,
          toToken,
          toAmount.toString()
        );
        if (input) {
          if (input.error) {
            return input.error;
          } else {
            const { decimals } = tokenLookup[fromToken.toLowerCase()];
            values.fromAmount = parseFloat(
              convert.toBalance(
                upwardSlippage(input.amountIn as BigNumber, SLIPPAGE_RATE),
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
        sendTransaction(() =>
          executeSwap(
            fromToken,
            toToken,
            lastTouchedField,
            lastTouchedField === "from"
              ? fromAmount.toString()
              : toAmount.toString()
          )
        );
      }
    },
    [executeSwap, sendTransaction]
  );

  useUserDataRegistrar(poolToTokens);

  return (
    <BaseInteraction
      title={tx("SWAP")}
      assets={pool.assets}
      spender={pool.id}
      onSubmit={handleSubmit}
      onChange={handleChange}
      extra={<SwapExtras pool={pool} />}
    />
  );
}

function SwapExtras({ pool }: Props) {
  const { values } = useFormikContext<InteractionValues>();
  const { fromToken, fromAmount, toToken, toAmount } = values;
  const swapCost = getSwapCost(toAmount, pool.swapFee);
  const defaultFromToken = useDefaultToken(pool, fromToken);
  const defaultToToken = useDefaultToken(pool, toToken);
  const rate = useMemo(() => {
    if (fromAmount && toAmount) {
      return (toAmount / fromAmount).toFixed(4);
    } else {
      const { spotPriceAfter = "" } = ethereumHelpers.calcSwapAmountOut(
        defaultFromToken,
        defaultToToken,
        convert.toBigNumber("1"),
        convert.toBigNumber(swapCost)
      );

      return convert.toBalance(spotPriceAfter!);
    }
  }, [fromAmount, toAmount, defaultFromToken, defaultToToken, swapCost]);

  return fromToken && toToken ? (
    <>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <TokenExchangeRate
          baseline={fromToken}
          comparison={toToken}
          rate={rate}
          fee={swapCost}
        />
        {FEATURE_FLAGS.usePlainLanguageTransaction && (
          <PlainLanguageTransaction />
        )}
      </Space>
      <Divider />
    </>
  ) : null;
}

// #region Helpers
function useDefaultToken(pool: FormattedIndexPool, token: string) {
  const poolInState = useSelector((state: AppState) =>
    selectors.selectPool(state, pool.id)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  return useMemo(() => {
    const fallback = {
      usedDenorm: "0",
      usedBalance: "0",
    };

    if (poolInState && token) {
      const { id } = tokenLookup[token.toLowerCase()];
      const entry = poolInState!.tokens.entities[id];

      return entry
        ? {
            usedDenorm: entry.usedDenorm,
            usedBalance: entry.usedBalance,
          }
        : fallback;
    } else {
      return fallback;
    }
  }, [poolInState, token, tokenLookup]);
}
// #endregion
