import { AiOutlineArrowRight } from "react-icons/ai";
import { AppState, FormattedIndexPool, selectors, signer } from "features";
import { Flipper, Token } from "components/atoms";
import { Form, Typography } from "antd";
import { TokenExchangeRate } from "components/molecules";
import { actions } from "features";
import { convert } from "helpers";
import { helpers } from "ethereum";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistoryChangeCallback,
  useTokenApproval,
  useTokenRandomizer,
} from "./common";
import React, { useCallback, useMemo, useRef, useState } from "react";
import TokenSelector from "../TokenSelector";
import styled, { keyframes } from "styled-components";

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
    token: "",
    amount: 0,
  },
  to: {
    token: "",
    amount: 0,
  },
};
const SLIPPAGE_RATE = 0.01;

const { Item } = Form;
const ZERO = convert.toBigNumber("0");

export default function SwapInteraction({ pool }: Props) {
  const dispatch = useDispatch();
  const [form] = Form.useForm<SwapValues>();
  const fullPool = useSelector((state: AppState) =>
    selectors.selectPool(state, pool?.id ?? "")
  );
  const previousFormValues = useRef<SwapValues>(INITIAL_STATE);
  const lastTouchedField = useRef<"input" | "output">("input");
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const swapFee = useSelector((state: AppState) =>
    selectors.selectSwapFee(state, pool?.id ?? "")
  );
  const [price, setPrice] = useState(ZERO);
  const [maxPrice, setMaxPrice] = useState(ZERO);
  const [formattedSwapFee, setFormattedSwapFee] = useState("");
  const [renderCount, setRenderCount] = useState(0);
  const baseline = previousFormValues.current.from.token;
  const comparison = previousFormValues.current.to.token;
  const previousFrom = useMemo(() => {
    if (renderCount > -1) {
      return previousFormValues.current.from;
    }
  }, [renderCount]);
  const previousTo = useMemo(() => {
    if (renderCount > -1) {
      return previousFormValues.current.to;
    }
  }, [renderCount]);
  const handleFlip = () => {
    const { from, to } = previousFormValues.current;
    const flippedValue = {
      from: to,
      to: from,
    };

    form.setFieldsValue(flippedValue);
    previousFormValues.current = flippedValue;
    triggerUpdate();
  };
  const getFormattedSwapFee = useCallback(
    (outputAmount: number): string =>
      convert
        .toBigNumber(outputAmount.toString(10))
        .times(
          convert.toBigNumber(
            (parseFloat(pool?.swapFee || "0") / 100).toString()
          )
        )
        .toString(10),
    [pool]
  );
  const triggerUpdate = () => setRenderCount((prev) => prev + 1);

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
      if (fullPool && swapFee) {
        const { amount: inputAmount } = changedValues.from;
        const { token: inputToken } = previousFormValues.current.from;
        const { token: outputToken } = previousFormValues.current.to;

        if (inputToken && outputToken) {
          const inputEntry = tokenLookup[inputToken.toLowerCase()];
          const outputEntry = tokenLookup[inputToken.toLowerCase()];

          if (inputEntry && outputEntry) {
            const inputData =
              fullPool.tokens.entities[
                tokenLookup[inputToken.toLowerCase()].id.toLowerCase()
              ];
            const outputData =
              fullPool.tokens.entities[
                tokenLookup[outputToken.toLowerCase()].id.toLowerCase()
              ];

            if (inputData && outputData) {
              const {
                outputAmount,
                price,
                spotPriceAfter,
                isGoodResult,
              } = await helpers.calculateOutputFromInput(
                inputData,
                outputData,
                inputAmount.toString(),
                swapFee
              );

              if (isGoodResult) {
                setPrice(price);
                setMaxPrice(
                  helpers.upwardSlippage(spotPriceAfter, SLIPPAGE_RATE)
                );
                setFormattedSwapFee(getFormattedSwapFee(outputAmount));

                form.setFieldsValue({ to: { amount: outputAmount } });
              }
            }
          }
        }
      }
    },
    [form, fullPool, tokenLookup, swapFee, getFormattedSwapFee]
  );
  /**
   *
   */
  const calculateInputFromOutput = useCallback(
    async (changedValues: SwapValues) => {
      if (fullPool && swapFee) {
        const { amount: outputAmount } = changedValues.to;
        const { token: outputToken } = previousFormValues.current.to;
        const { token: inputToken } = previousFormValues.current.from;
        const inputEntry = tokenLookup[inputToken.toLowerCase()];
        const outputEntry = tokenLookup[inputToken.toLowerCase()];

        if (inputEntry && outputEntry) {
          const inputData =
            fullPool.tokens.entities[
              tokenLookup[inputToken.toLowerCase()].id.toLowerCase()
            ];
          const outputData =
            fullPool.tokens.entities[
              tokenLookup[outputToken.toLowerCase()].id.toLowerCase()
            ];

          if (inputData && outputData) {
            const {
              inputAmount,
              spotPriceAfter,
              isGoodResult,
            } = await helpers.calculateInputFromOutput(
              inputData,
              outputData,
              outputAmount.toString(),
              swapFee
            );

            if (isGoodResult) {
              setMaxPrice(spotPriceAfter.times(SLIPPAGE_RATE));

              form.setFieldsValue({ from: { amount: inputAmount } });
            }
          }
        }
      }
    },
    [form, fullPool, tokenLookup, swapFee]
  );
  /**
   *
   */
  const handleSubmit = useCallback(
    async (values: SwapValues) => {
      if (pool && signer) {
        const { amount: inputAmount, token: inputToken } = values.from;
        const { amount: outputAmount, token: outputToken } = values.to;

        dispatch(
          actions.swap(
            pool.id,
            lastTouchedField.current,
            inputAmount.toString(),
            inputToken.toLowerCase(),
            outputAmount.toString(),
            outputToken.toLowerCase(),
            maxPrice
          )
        );
      }
    },
    [dispatch, pool, maxPrice]
  );
  /**
   *
   * @param _ -
   * @param value -
   */
  const checkAmount = (_: any, value: { amount: number }) => {
    return value.amount > 0
      ? Promise.resolve()
      : Promise.reject("Amount must be greater than zero.");
  };
  const handleSendTransaction = useCallback((values) => handleSubmit(values), [
    handleSubmit,
  ]);

  useTokenRandomizer({
    pool,
    from: baseline,
    to: comparison,
    changeFrom: (newFrom: string) =>
      form.setFieldsValue({
        from: {
          token: newFrom,
        },
      }),
    changeTo: (newTo: string) =>
      form.setFieldsValue({
        to: {
          token: newTo,
        },
      }),
    callback: () => {
      triggerUpdate();
      previousFormValues.current = form.getFieldsValue();
    },
  });

  useTokenApproval({
    pool,
    from: previousFrom!,
    to: previousTo!,
    onSendTransaction: handleSendTransaction,
  });

  useHistoryChangeCallback(() => form.resetFields());

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
          lastTouchedField.current = "input";
          calculateOutputFromInput(changedValues);
        } else if (changedValues.to) {
          lastTouchedField.current = "output";
          calculateInputFromOutput(changedValues);
        }

        triggerUpdate();
      }}
      onFinish={(values: any) => handleSubmit(values)}
      onFinishFailed={(error) =>
        console.log("Submission failed. Error was: ", error)
      }
    >
      <S.Title>
        <span>Swap</span>
        {baseline && comparison && (
          <span>
            <Token name="Baseline" image={baseline} />
            <S.Swap />
            <Token name="Comparison" image={comparison} />
          </span>
        )}
      </S.Title>
      <Item name="from" rules={[{ validator: checkAmount }]}>
        {pool && <TokenSelector label="From" assets={pool.assets} />}
      </Item>
      <Flipper onFlip={handleFlip} />
      <Item name="to" rules={[{ validator: checkAmount }]}>
        {pool && <TokenSelector label="To" assets={pool.assets} />}
      </Item>
      {previousFormValues.current.from.token &&
        previousFormValues.current.to.token && (
          <S.Item>
            <TokenExchangeRate
              baseline={baseline}
              comparison={comparison}
              fee={formattedSwapFee}
              rate={price.toString()}
            />
          </S.Item>
        )}
    </S.Form>
  );
}

const blinking = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.3;
  }
`;

const S = {
  Swap: styled(AiOutlineArrowRight)`
    position: absolute;
    top: 9px;
    right: 21px;
  `,
  Form: styled(Form)`
    img {
      ${(props) => props.theme.snippets.size40};
      opacity: 0.7;
      border-radius: 50%;
      animation-name: ${blinking};
      animation-duration: 2s;
      animation-iteration-count: infinite;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
  `,
  Item: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
  Title: styled(Typography.Title)`
    ${(props) => props.theme.snippets.spacedBetween};
    position: relative;
    font-weight: 200 !important;
  `,
};
