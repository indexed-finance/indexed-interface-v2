import Area, { Props } from "./Area";
import React from "react";

const Template = (args: Props) => <Area {...args} />;

export const Basic = Template.bind({});

(Basic as typeof Area & { args: Props }).args = {
  children: "Lorem ipsum dolor sit amet.",
};

export default {
  title: "Atoms/Area",
  component: Area,
};
