import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, Flipper } from "components/atoms";
import { Form, Typography } from "antd";
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
const ONE = convert.toBigNumber("1");
const TEN = convert.toBigNumber("10");
const TOKEN_AMOUNT = TEN.exponentiatedBy(18);

export default function SwapInteraction({ pool }: Props) {
  const [form] = Form.useForm<SwapValues>();
  const previousFormValues = useRef<SwapValues>(INITIAL_STATE);
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const swapFee = useSelector((state: AppState) =>
    selectors.selectSwapFee(state, pool?.id ?? "")
  );
  const [price, setPrice] = useState(ZERO);
  const [, setMaxPrice] = useState(ZERO);
  const [, setRenderCount] = useState(0);

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
      if (pool && swapFee) {
        const { amount: inputAmount } = changedValues.from;
        const { token: inputToken } = previousFormValues.current.from;
        const { token: outputToken } = previousFormValues.current.to;
        const inputTokenData = tokenLookup[inputToken.toLowerCase()];
        const outputTokenData = tokenLookup[outputToken.toLowerCase()];

        if (inputTokenData && outputTokenData) {
          const inputUpdates = inputTokenData.dataFromPoolUpdates[pool.id];
          const outputPool = outputTokenData.dataByIndexPool[pool.id];
          const outputUpdates = outputTokenData.dataFromPoolUpdates[pool.id];

          if (inputUpdates && outputPool && outputUpdates) {
            const {
              usedBalance: inputUsedBalance,
              usedDenorm: inputUsedDenorm,
            } = inputUpdates;
            const { denorm: outputDenorm } = outputPool;
            const {
              balance: outputBalance,
              usedBalance: outputUsedBalance,
              usedDenorm: outputUsedDenorm,
            } = outputUpdates;

            const [balanceIn, weightIn, balanceOut, weightOut, amountIn] = [
              inputUsedBalance,
              inputUsedDenorm,
              outputBalance,
              outputDenorm,
              convert.toToken(inputAmount.toString()),
            ]
              .filter(Boolean)
              .map((property) => convert.toBigNumber(property!));

            if (
              amountIn.isLessThanOrEqualTo(
                convert.toBigNumber(outputUsedBalance)
              )
            ) {
              const amountOut = balancerMath.calcOutGivenIn(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountIn,
                swapFee
              );
              const spotPriceAfter = balancerMath.calcSpotPrice(
                balanceIn.plus(amountIn),
                weightIn,
                convert.toBigNumber(outputUsedBalance).minus(amountOut),
                convert.toBigNumber(outputUsedDenorm),
                swapFee
              );

              setMaxPrice(spotPriceAfter.times(1.02));

              form.setFieldsValue({
                to: {
                  amount: parseFloat(convert.toBalance(amountOut)),
                },
              });

              if (amountIn.isEqualTo(0) || amountOut.isEqualTo(0)) {
                console.log("Zero.");

                const oneToken = TOKEN_AMOUNT;
                const preciseInput = balancerMath.calcOutGivenIn(
                  balanceIn,
                  weightIn,
                  balanceOut,
                  weightOut,
                  oneToken,
                  swapFee
                );
                const preciseOutput = preciseInput.dividedBy(TOKEN_AMOUNT);
                const price = preciseOutput.dividedBy(ONE);

                console.log({
                  preciseInput: preciseInput.toString(),
                  preciseOutput: preciseOutput.toString(),
                  price: price.toString(),
                });

                setPrice(price);
              } else {
                console.log("Not Zero.");

                const preciseInput = amountIn.dividedBy(TOKEN_AMOUNT);
                const preciseOutput = amountOut.dividedBy(TOKEN_AMOUNT);
                const price = preciseOutput.dividedBy(preciseInput);

                console.log({
                  preciseInput: preciseInput.toString(),
                  preciseOutput: preciseOutput.toString(),
                  price: price.toString(),
                });

                setPrice(price);
              }
            } else {
              setMaxPrice(ZERO);
            }
          }
        }
      }
    },
    [form, pool, tokenLookup, swapFee]
  );
  /**
   *
   */
  const calculateInputFromOutput = useCallback(
    async (changedValues: SwapValues) => {
      if (pool && swapFee) {
        const { amount: outputAmount } = changedValues.to;
        const { token: outputToken } = previousFormValues.current.to;
        const { token: inputToken } = previousFormValues.current.from;
        const inputPoolData = tokenLookup[inputToken.toLowerCase()];
        const outputPoolData = tokenLookup[outputToken.toLowerCase()];

        if (inputPoolData && outputPoolData) {
          const inputUpdates = inputPoolData.dataFromPoolUpdates[pool.id];
          const outputUpdates = outputPoolData.dataFromPoolUpdates[pool.id];

          if (inputUpdates && outputUpdates) {
            const {
              usedBalance: inputUsedBalance,
              usedDenorm: inputUsedDenorm,
            } = inputUpdates;
            const {
              balance: outputBalance,
              usedBalance: outputUsedBalance,
              usedDenorm: outputUsedDenorm,
            } = outputUpdates;
            const { denorm: outputDenorm } = outputPoolData.dataByIndexPool[
              pool.id!
            ]!;
            const [balanceIn, weightIn, balanceOut, weightOut, amountOut] = [
              inputUsedBalance,
              inputUsedDenorm,
              outputBalance,
              outputDenorm,
              convert.toToken(outputAmount.toString()),
            ]
              .filter(Boolean)
              .map((property) => convert.toBigNumber(property!));

            if (
              amountOut.isLessThanOrEqualTo(
                convert.toBigNumber(outputUsedBalance).div(3)
              )
            ) {
              const amountIn = balancerMath.calcInGivenOut(
                balanceIn,
                weightIn,
                balanceOut,
                weightOut,
                amountOut,
                swapFee
              );
              const spotPriceAfter = balancerMath.calcSpotPrice(
                balanceIn.plus(amountIn),
                weightIn,
                convert.toBigNumber(outputUsedBalance).minus(amountOut),
                convert.toBigNumber(outputUsedDenorm),
                swapFee
              );

              setMaxPrice(spotPriceAfter.times(1.02));

              form.setFieldsValue({
                from: {
                  amount: parseFloat(convert.toBalance(amountIn)),
                },
              });
            } else {
              setMaxPrice(ZERO);
            }
          }
        }
      }
    },
    [form, pool, tokenLookup, swapFee]
  );

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

        // Force update.
        setRenderCount((prev) => prev + 1);
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
      <Item></Item>
      {previousFormValues.current.from && previousFormValues.current.to && (
        <S.Item>
          <div>
            <>
              1 {previousFormValues.current.from.token} ≈ {price.toPrecision(5)}{" "}
              {previousFormValues.current.to.token}
            </>
            {pool && (
              <div>
                Fee:{" "}
                {convert
                  .toBigNumber(previousFormValues.current.to.amount.toString())
                  .times(parseFloat(pool.swapFee) / 100)
                  .toPrecision(5)}{" "}
                {previousFormValues.current.to.token}
              </div>
            )}
          </div>
        </S.Item>
      )}
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
  Item: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};
