import {
  AppState,
  FormattedIndexPool,
  selectors,
  useUserDataRegistrar,
} from "features";
import { BigNumber } from "ethereum/utils/balancer-math";
import { Divider, Space } from "antd";
import { PlainLanguageTransaction, TokenExchangeRate } from "components";
import { SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { getSwapCost } from "ethereum/utils";
import { useCallback, useMemo } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import { useSwapCallbacks } from "hooks";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";

interface Props {
  pool: FormattedIndexPool;
}

export default function SwapInteraction({ pool }: Props) {
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeSwap,
  } = useSwapCallbacks(pool.id);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, pool.id)
  );
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
        executeSwap(
          fromToken,
          toToken,
          lastTouchedField,
          lastTouchedField === "from"
            ? fromAmount.toString()
            : toAmount.toString()
        );
      }
    },
    [executeSwap]
  );

  useUserDataRegistrar(pool.id, tokenIds);

  return (
    <BaseInteraction
      title="Swap"
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
  const rate = useMemo(() => {
    if (fromAmount && toAmount) {
      return (toAmount / fromAmount).toFixed(4);
    }
    return "";
  }, [fromAmount, toAmount]);

  return fromToken && toToken ? (
    <>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <TokenExchangeRate
          baseline={fromToken}
          comparison={toToken}
          rate={rate}
          fee={swapCost}
        />
        <PlainLanguageTransaction />
      </Space>
      <Divider />
    </>
  ) : null;
}
