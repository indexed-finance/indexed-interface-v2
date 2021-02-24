import { Radio as AntRadio, RadioGroupProps, RadioProps } from "antd";
import React, { ReactNode } from "react";
import styled from "styled-components";

export type Props = RadioProps;

export type GroupProps = RadioGroupProps & {
  label?: ReactNode;
};

function BaseRadio(props: Props) {
  return <AntRadio {...props} />;
}

type WithExtras = typeof BaseRadio & {
  Group: (props: GroupProps) => JSX.Element;
};

const Radio = BaseRadio as WithExtras;

export default Radio;

// #region Variants
Radio.Group = function (props) {
  return (
    <>
      {props.label && <S.Label>{props.label}</S.Label>}
      <AntRadio.Group {...props} />
    </>
  );
};
// #endregion

const S = {
  Label: styled.h4`
    color: ${(props) => props.theme.input.label.color};

    ${(props) => props.theme.snippets.fancy};
  `,
};
