import Quote, { Props } from "./Quote";
import React from "react";

export const Basic = (args: Props) => <Quote {...args} />;

Basic.args = {
  symbol: "CC10",
  price: 102.3,
  netChange: 1,
  netChangePercent: 0.05,
};

export default {
  title: "Molecules/Quote",
  component: Quote,
};
