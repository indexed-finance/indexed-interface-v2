import Panel, { FeeProps, Props, RateProps } from "./Panel";
import React from "react";

const Template = (args: Props) => <Panel {...args} />;
const getTemplate = () =>
  (Template.bind({}) as unknown) as JSX.Element & { args: Props };

export const Basic = getTemplate();

Basic.args = {
  title: "Foo",
  value: "Bar",
};

export const Rate = (args: RateProps) => <Panel.Rate {...args} />;

Rate.args = {
  from: "UNI",
  rate: 3.14,
  to: "LINK",
};

export const Fee = (args: FeeProps) => <Panel.Fee {...args} />;

Fee.args = {
  value: 50,
  token: "LINK",
};

export default {
  title: "Atoms/Panel",
  component: Panel,
};
