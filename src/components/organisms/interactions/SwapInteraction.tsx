import { AppState, FormattedIndexPool, selectors } from "features";
import { BigNumber } from "bignumber.js";
import { Button, Flipper } from "components/atoms";
import { Form, Typography } from "antd";
import { PoolTokenUpdate } from "ethereum/types.d";
import { SPOT_PRICE_MODIFIER } from "config";
import { balancerMath } from "ethereum";
import { convert } from "helpers";
import { useSelector } from "react-redux";
import React, { useCallback, useRef, useState } from "react";
import TokenSelector from "../TokenSelector";
import styled from "styled-components";

interface Props {
  pool: null | FormattedIndexPool;
}

type SwapValues = typeof INITIAL_STATE;

const FIELD_OPPOSITES = {
  from: "to",
  to: "from",
};

const INITIAL_STATE = {
  from: {
    token: "UNI",
    amount: 0,
  },
  to: {
    token: "",
    amount: 0,
  },
};

const { Item } = Form;
const ZERO = convert.toBigNumber("0");

export default function SwapInteraction({ pool }: Props) {
  const [form] = Form.useForm<SwapValues>();
  const previousFormValues = useRef<SwapValues>(INITIAL_STATE);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const swapFee = useSelector((state: AppState) =>
    selectors.selectSwapFee(state, pool?.id ?? "")
  );
  const [maxPrice, setMaxPrice] = useState(ZERO);

  /**
   *
   */
  const checkForDuplicates = useCallback(
    (changedValues: SwapValues) => {
      for (const [changedField, changedValue] of Object.entries(
        changedValues
      )) {
        const swapKey = changedField as keyof SwapValues;
        const otherSwapKey = FIELD_OPPOSITES[swapKey] as keyof SwapValues;

        if (otherSwapKey) {
          const { [otherSwapKey]: otherFieldValue } = form.getFieldsValue();

          if (changedValue.token === otherFieldValue.token) {
            const {
              [swapKey]: { token },
            } = previousFormValues.current;

            form.setFieldsValue({
              [otherSwapKey]: {
                token,
              },
            });
          }
        }
      }
    },
    [form]
  );
  /**
   *
   */
  const calculateOutputFromInput = useCallback(
    async (changedValues: SwapValues) => {
      const { amount: inputAmount } = changedValues.from;
      const { token: inputToken } = previousFormValues.current.from;
      const { token: outputToken } = previousFormValues.current.to;
      const inputPoolData =
        tokenLookup[inputToken.toLowerCase()]?.dataFromPoolUpdates[pool!.id];
      const outputPoolData =
        tokenLookup[outputToken.toLowerCase()]?.dataFromPoolUpdates[pool!.id];

      if (pool && inputPoolData && outputPoolData && swapFee) {
        const { usedBalance: usedBalanceString } = inputPoolData;
        const usedBalance = convert.toBigNumber(usedBalanceString);
        const balanceToCompare = usedBalance.dividedBy(2);
        const amountInTokens = convert.toToken(inputAmount.toString());

        if (amountInTokens.isLessThanOrEqualTo(balanceToCompare)) {
          const { amount, maxPrice } = await getCorrectOutputAmount(
            inputAmount,
            inputPoolData,
            outputPoolData,
            swapFee
          );

          setMaxPrice(maxPrice);

          form.setFieldsValue({
            to: {
              amount: parseFloat(amount),
            },
          });
        } else {
          setMaxPrice(ZERO);
        }
      }
    },
    [form, pool, tokenLookup, swapFee]
  );
  /**
   *
   */
  const calculateInputFromOutput = useCallback((changedValues: SwapValues) => {
    return true;
  }, []);

  const checkAmount = (_: any, value: { amount: number }) => {
    return value.amount > 0
      ? Promise.resolve()
      : Promise.reject("Amount must be greater than zero.");
  };

  const handleFlip = () => {
    const { from, to } = previousFormValues.current;
    const flippedValue = {
      from: to,
      to: from,
    };

    form.setFieldsValue(flippedValue);
    previousFormValues.current = flippedValue;
  };

  return (
    <S.Form
      form={form}
      name="swap"
      size="large"
      labelAlign="left"
      layout="vertical"
      initialValues={INITIAL_STATE}
      onValuesChange={(changedValues) => {
        checkForDuplicates(changedValues);

        // Update previous values for future comparisons.
        previousFormValues.current = form.getFieldsValue();

        if (changedValues.from) {
          calculateOutputFromInput(changedValues);
        } else if (changedValues.to) {
          calculateInputFromOutput(changedValues);
        }
      }}
      onFinish={(result) => console.log("Submitted. Results are: ", result)}
      onFinishFailed={(error) =>
        console.log("Submission failed. Error was: ", error)
      }
    >
      <Item>
        <Typography.Title level={2}>Swap</Typography.Title>
      </Item>
      <Item name="from" rules={[{ validator: checkAmount }]}>
        {pool && <TokenSelector label="From" pool={pool} />}
      </Item>
      <Item>
        <Flipper onFlip={handleFlip} />
      </Item>
      <Item name="to" rules={[{ validator: checkAmount }]}>
        {pool && <TokenSelector label="To" balance="0.30" pool={pool} />}
      </Item>
      <Item>Max Price: {convert.toBalance(maxPrice)}</Item>
      <Item>
        <Button type="primary" htmlType="submit">
          Send Transaction
        </Button>
      </Item>
    </S.Form>
  );
}

const S = {
  Form: styled(Form)``,
};

// #region Helpers
function getMaxPrice(
  balanceIn: BigNumber,
  weightIn: BigNumber,
  balanceOut: BigNumber,
  weightOut: BigNumber,
  swapFee: BigNumber
) {
  const numerator = balancerMath.bdiv(balanceIn, weightIn);
  const denominator = balancerMath.bdiv(balanceOut, weightOut);
  const ratio = balancerMath.bdiv(numerator, denominator);
  const scale = balancerMath.bdiv(
    balancerMath.BONE,
    balancerMath.bsubSign(balancerMath.BONE, swapFee).res
  );

  return balancerMath.bmul(ratio, scale).multipliedBy(SPOT_PRICE_MODIFIER);
}

async function getCorrectOutputAmount(
  inputAmount: number,
  inputData: PoolTokenUpdate,
  outputData: PoolTokenUpdate,
  swapFee: BigNumber
) {
  const {
    usedBalance: inputUsedBalance,
    usedDenorm: inputUsedDenorm,
  } = inputData;
  const {
    usedBalance: outputUsedBalance,
    usedDenorm: outputUsedDenorm,
  } = outputData;
  const [balanceIn, weightIn, balanceOut, weightOut, amountIn] = [
    inputUsedBalance,
    inputUsedDenorm,
    outputUsedBalance,
    outputUsedDenorm,
    convert.toToken(inputAmount.toString()),
  ].map((property) => convert.toBigNumber(property));
  const weightRatio = balancerMath.bdiv(weightIn, weightOut);
  const adjustedIn = balancerMath.bmul(
    amountIn,
    balancerMath.BONE.minus(swapFee)
  );
  const nextVariable = balancerMath.bdiv(balanceIn, balanceIn.plus(adjustedIn));
  const nextNextVariable = balancerMath.bpow(nextVariable, weightRatio);
  const lastVariable = balancerMath.BONE.minus(nextNextVariable);
  const amountOut = balancerMath.bmul(balanceOut, lastVariable);
  const maxPrice = getMaxPrice(
    balanceIn.plus(balancerMath.bnum(amountIn)),
    weightIn,
    balanceOut.minus(amountOut),
    weightOut,
    swapFee
  );

  return {
    amount: convert.toBalance(amountOut),
    maxPrice,
  };
}
// #endregion
