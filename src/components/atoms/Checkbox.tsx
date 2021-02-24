import { Checkbox as AntCheckbox, CheckboxProps } from "antd";
import React from "react";

export type Props = CheckboxProps;

export default function Checkbox(props: Props) {
  return <AntCheckbox {...props} />;
}
