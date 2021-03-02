import { AppState, FormattedIndexPool, selectors, signer } from "features";
import { Flipper } from "components/atoms";
import { Form, Typography } from "antd";
import { SubscreenContext } from "app/subscreens/Subscreen";
import { actions } from "features";
import { convert } from "helpers";
import { helpers } from "ethereum";
import { useDispatch, useSelector } from "react-redux";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
    token: "SNX",
    amount: 2,
  },
  to: {
    token: "UNI",
    amount: 1,
  },
};
const SLIPPAGE_RATE = 0.01;

const { Item } = Form;
const ZERO = convert.toBigNumber("0");

export default function SwapInteraction({ pool }: Props) {
  const [form] = Form.useForm<SwapValues>();
  const dispatch = useDispatch();
  const { setActions } = useContext(SubscreenContext);
  const previousFormValues = useRef<SwapValues>(INITIAL_STATE);
  const lastTouchedField = useRef<"input" | "output">("input");
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);
  const swapFee = useSelector((state: AppState) =>
    selectors.selectSwapFee(state, pool?.id ?? "")
  );
  const [price, setPrice] = useState(ZERO);
  const [maxPrice, setMaxPrice] = useState(ZERO);
  const [, setRenderCount] = useState(0);
  const approvalNeeded = useSelector((state: AppState) => {
    const { from } = form.getFieldsValue();

    if (from) {
      const poolId = pool?.id ?? "";
      const { token, amount } = from;

      return selectors.selectApprovalStatus(
        state,
        poolId,
        token.toLowerCase(),
        amount.toString()
      );
    } else {
      return true;
    }
  });

  /**
   *
   */
  const handleApprovePool = useCallback(() => {
    if (pool) {
      const {
        from: { token, amount },
      } = form.getFieldsValue();
      dispatch(
        actions.approvePool(pool.id, token.toLowerCase(), amount.toString())
      );
    }
  }, [dispatch, form, pool]);

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
          const {
            outputAmount,
            price,
            spotPriceAfter,
            isGoodResult,
          } = await helpers.calculateOutputFromInput(
            pool.id,
            inputAmount.toString(),
            inputTokenData,
            outputTokenData,
            swapFee
          );

          if (isGoodResult) {
            setPrice(price);
            setMaxPrice(spotPriceAfter.times(SLIPPAGE_RATE));

            form.setFieldsValue({
              to: {
                amount: outputAmount,
              },
            });
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
        const inputTokenData = tokenLookup[inputToken.toLowerCase()];
        const outputTokenData = tokenLookup[outputToken.toLowerCase()];

        if (inputTokenData && outputTokenData) {
          const {
            inputAmount,
            spotPriceAfter,
            isGoodResult,
          } = await helpers.calculateInputFromOutput(
            pool.id,
            outputAmount.toString(),
            inputTokenData,
            outputTokenData,
            swapFee
          );

          if (isGoodResult) {
            setMaxPrice(spotPriceAfter.times(SLIPPAGE_RATE));

            form.setFieldsValue({
              to: {
                amount: inputAmount,
              },
            });
          }
        }
      }
    },
    [form, pool, tokenLookup, swapFee]
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
  /**
   *
   */
  const handleFlip = () => {
    const { from, to } = previousFormValues.current;
    const flippedValue = {
      from: to,
      to: from,
    };

    form.setFieldsValue(flippedValue);
    previousFormValues.current = flippedValue;
  };

  // Effect:
  // When approval status is determined, update the actions of the parent panel accordingly.
  useEffect(() => {
    if (approvalNeeded) {
      setActions([
        {
          type: "primary",
          title: "Approve",
          onClick: handleApprovePool,
        },
      ]);
    } else {
      setActions([
        {
          type: "primary",
          title: "Send Transaction",
          onClick: () => handleSubmit(form.getFieldsValue()),
        },
      ]);
    }
  }, [form, approvalNeeded, handleApprovePool, handleSubmit, setActions]);

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

        // Force update.
        setRenderCount((prev) => prev + 1);
      }}
      onFinish={(values: any) => handleSubmit(values)}
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
        {pool && <TokenSelector label="To" pool={pool} />}
      </Item>
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
    </S.Form>
  );
}

const S = {
  Form: styled(Form)``,
  Item: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};
