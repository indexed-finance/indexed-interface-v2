import Input, { Props, TradeProps } from "./Input";
import React from "react";

const Template = (args: Props) => <Input {...args} />;
const getTemplate = () =>
  (Template.bind({}) as unknown) as JSX.Element & { args: Props };

export const Text = getTemplate();

Text.args = {
  type: "text",
  value: "Hello world.",
};

export const Number = getTemplate();

Number.args = {
  type: "number",
  value: 42,
};

export const Trade = (args: TradeProps) => <Input.Trade {...args} />;

Trade.args = {
  value: 50,
  label: "Label",
};

export const TradeExtra = (args: TradeProps) => <Input.Trade {...args} />;

TradeExtra.args = {
  value: 50,
  label: "Label",
  extra: "This is extra text beneath the input.",
};

export const TradeError = (args: TradeProps) => <Input.Trade {...args} />;

TradeError.args = {
  value: 50,
  label: "Label",
  error: "We got a problem here.",
};

export default {
  title: "Atoms/Input",
  component: Input,
};
