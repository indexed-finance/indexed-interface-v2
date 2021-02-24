import Button, { ButtonGroupProps, Props } from "./Button";
import React from "react";

const Template = (args: Props) => <Button {...args} />;

export const Basic = Template.bind({});

(Basic as typeof Button & { args: Props }).args = {
  disabled: false,
  type: "primary",
  children: "Click me",
};

export const HorizontalGroup = (args: ButtonGroupProps) => (
  <Button.Group {...args} orientation="horizontal">
    <Button type="primary">Button A</Button>
    <Button type="default">Button B</Button>
    <Button type="default">Button C</Button>
  </Button.Group>
);

export const VerticalGroup = (args: ButtonGroupProps) => (
  <Button.Group {...args} orientation="vertical">
    <Button type="primary">Button A</Button>
    <Button type="default">Button B</Button>
    <Button type="default">Button C</Button>
  </Button.Group>
);

export const CompactGroup = (args: ButtonGroupProps) => (
  <Button.Group {...args} orientation="horizontal" compact={true}>
    <Button type="primary">Button A</Button>
    <Button type="default">Button B</Button>
    <Button type="default">Button C</Button>
  </Button.Group>
);

export default {
  title: "Atoms/Button",
  component: Button,
};
