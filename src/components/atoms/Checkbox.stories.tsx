import Checkbox, { Props } from "./Checkbox";
import React from "react";

const Template = (args: Props) => <Checkbox {...args} />;

export const Basic = Template.bind({});

(Basic as typeof Checkbox & { args: Props }).args = {
  checked: true,
};

export default {
  title: "Atoms/Checkbox",
  component: Checkbox,
};
