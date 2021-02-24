import Radio, { GroupProps, Props } from "./Radio";
import React from "react";

const Template = (args: Props) => <Radio {...args} />;

export const Basic = Template.bind({});

(Basic as typeof Radio & { args: Props }).args = {
  checked: true,
};

export const Group = (args: GroupProps) => (
  <Radio.Group {...args}>
    <Radio value={1}>Option 1</Radio>
    <Radio value={2}>Option 2</Radio>
    <Radio value={3}>Option 3</Radio>
  </Radio.Group>
);

Group.args = {
  value: 1,
  label: "Foo",
};

export default {
  title: "Atoms/Radio",
  component: Radio,
};
