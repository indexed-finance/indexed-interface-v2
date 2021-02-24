import RankedToken, { Props } from "./RankedToken";
import React from "react";

export const Basic = (args: Props) => <RankedToken {...args} />;

Basic.args = {
  token: {
    symbol: "AAVE",
    current: {
      balance: "30000000",
      weight: "30000000",
    },
  },
  rank: 1,
};

export default {
  title: "Molecules/RankedToken",
  component: RankedToken,
};
