import { AppState, FormattedIndexPool, selectors } from "features";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Radio } from "antd";
import { SLIPPAGE_RATE } from "config";
import { convert } from "helpers";
import { downwardSlippage, upwardSlippage } from "ethereum";
import { usePoolTokenAddresses } from "features/indexPools/hooks";
import { useSelector } from "react-redux";
import { useSingleTokenBurnCallbacks } from "hooks/use-burn-callbacks";
import { useTokenUserDataListener } from "features/batcher/hooks";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";
import BigNumber from "bignumber.js";
interface Props {
  pool: FormattedIndexPool;
}

export default function BurnInteraction({ pool }: Props) {
  const [burnType, setBurnType] = useState<"single" | "uniswap" | "multi">("single");
  return <Fragment>
    <Radio.Group value={burnType} onChange={({ target: { value } }) => {setBurnType(value)}}>
      <Radio.Button value="single">Single Output</Radio.Button>
      <Radio.Button value="multi">Multi Output</Radio.Button>
      <Radio.Button value="uniswap">Uniswap</Radio.Button>
    </Radio.Group>
    { burnType === "single" && <SingleTokenBurnInteraction pool={pool} /> }
    {/* { mintType === "uniswap" && <UniswapMintInteraction pool={pool} /> } */}
  </Fragment>
}

function SingleTokenBurnInteraction({ pool }: Props) {
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const poolTokenIds = usePoolTokenAddresses(pool.id);
  const tokenIds = useMemo(() => [
    ...poolTokenIds,
    pool.id,
  ], [poolTokenIds, pool.id]);
  const {
    calculateAmountIn,
    calculateAmountOut,
    executeBurn
  } = useSingleTokenBurnCallbacks(pool.id);

  useTokenUserDataListener(pool.id, tokenIds);

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
      title="Burn"
      assets={pool.assets}
      spender={pool.id}
      onSubmit={handleSubmit}
      onChange={handleChange}
      defaultInputSymbol={pool.symbol}
      disableInputSelect
      requiresApproval={false}
    />
  );
}