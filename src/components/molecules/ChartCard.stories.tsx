import ChartCard, { Props } from "./ChartCard";
import React from "react";

export const Basic = (args: Props) => <ChartCard {...args} />;

Basic.args = {
  timeframe: "1D",
};

export default {
  title: "Molecules/ChartCard",
  component: ChartCard,
};
