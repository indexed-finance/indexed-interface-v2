
import { AiOutlineArrowRight } from "react-icons/ai";
import { Button, Form, Space, Typography } from "antd";
import { Flipper, Token } from "components/atoms";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { TokenExchangeRate } from "components/molecules";
import ExchangeTokenImages from "components/atoms/ExchangeTokenImages";
import TokenSelector from "./TokenSelector";

type Asset = { name: string; symbol: string; id: string; };

type TokenSide = { token: string; amount: number };

type Props = {
  title: string;
  assetOptions: Asset[];
  defaultInput: string;
  defaultOutput: string;
  /**
   * Fee paid on the exchange.
   * @example 0.01 = 1%
  */
  swapFee: number;
  /**
   * Handle changes to the fields - optionally mutate the values.
   */
  onChange: (values: TwoTokenExchangeFormValues) => void;
  children: ReactNode;
}

export type ActionConfig = {
  title: string;
  onSubmit: () => void;
  disabled: boolean;
}

export enum TokenField {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT"
}

export type TwoTokenExchangeFormValues = {
  from: TokenSide;
  to: TokenSide;
  lastTouchedField: TokenField;
};

const checkAmount = (_: any, value: { amount: number }) => {
  return value.amount > 0
    ? Promise.resolve()
    : Promise.reject("Amount must be greater than zero.");
};

const { Item } = Form;

type TokenRateInfo = {
  rate: string;
  fee: string;
  baseline: string;
  comparison: string;
};

export default function TwoTokenExchangeForm(
  {
    assetOptions,
    defaultInput,
    defaultOutput,
    onChange,
    swapFee,
    children
  }: Props
) {
  const [form] = Form.useForm<TwoTokenExchangeFormValues>();
  const [rateInfo, setRateInfo] = useState<TokenRateInfo>({
    rate: "0",
    fee: "0",
    baseline: defaultInput,
    comparison: defaultOutput
  });

  const initialValues: TwoTokenExchangeFormValues = useMemo(() => ({
    from: {
      token: defaultInput,
      amount: 0
    },
    to: {
      token: defaultOutput,
      amount: 0
    },
    lastTouchedField: TokenField.INPUT
  }), [defaultInput, defaultOutput]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [ form, initialValues ])

  const handleChange = useCallback((changedValues: TwoTokenExchangeFormValues) => {
    const newValues = { ...form.getFieldsValue() };
    if (changedValues.from) {
      newValues.lastTouchedField = TokenField.INPUT;
    } else if (changedValues.to) {
      newValues.lastTouchedField = TokenField.OUTPUT;
    }
    onChange(newValues);
    form.setFieldsValue(newValues);
    setRateInfo({
      rate: (newValues.from.amount / newValues.to.amount).toPrecision(4),
      fee: (newValues.to.amount * swapFee).toPrecision(4),
      baseline: newValues.from.token,
      comparison: newValues.to.token
    })
  }, [ form, onChange, setRateInfo, swapFee ])

  const handleFlip = useCallback(() => {
    const { from, to, lastTouchedField } = form.getFieldsValue();
    const flippedValue = {
      from: to,
      to: from,
      lastTouchedField//: OppositeSide[lastTouchedField]
    };
    onChange(flippedValue);
    form.setFieldsValue(flippedValue);
    // triggerUpdate()
  }, [form, onChange]);

  // Filter input options not selected as output
  const inputOptions = useMemo(() => {
    const { to } = form.getFieldsValue();
    if (!to) return assetOptions;
    return assetOptions.filter((asset) => to.token !== asset.symbol);
  }, [assetOptions, form]);

  // Filter output options not selected as input
  const outputOptions = useMemo(() => {
    const { from } = form.getFieldsValue();
    if (!from) return assetOptions;
    return assetOptions.filter((asset) => from.token !== asset.symbol);
  }, [assetOptions, form]);

  return <Form
    form={form}
    name="swap"
    size="large"
    labelAlign="left"
    layout="vertical"
    initialValues={initialValues}
    onValuesChange={(changedValues) => {
      handleChange(changedValues);
    }}
  >
      <ExchangeTokenImages baseline={rateInfo.baseline} comparison={rateInfo.comparison} />
      <Item name="from" rules={[{ validator: checkAmount }]}>
        <TokenSelector label="From" assets={inputOptions} />
      </Item>
      <Flipper onFlip={handleFlip} />
      <Item name="to" rules={[{ validator: checkAmount }]}>
        <TokenSelector label="To" assets={outputOptions} />
      </Item>
      <div>
        <TokenExchangeRate { ...rateInfo } />
      </div>
      { children }
  </Form>
}