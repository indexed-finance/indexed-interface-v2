import {
  Alert,
  Input as AntInput,
  InputNumber,
  InputNumberProps,
  InputProps,
} from "antd";
import React, { ReactNode } from "react";
import styled, { css } from "styled-components";

export type Props = InputProps;

function BaseInput(props: InputProps) {
  return <AntInput {...props} />;
}

type WithExtras = typeof BaseInput & {
  Trade: (props: TradeProps) => JSX.Element;
};

const Input = BaseInput as WithExtras;

export default Input;

// #region Variants
export type TradeProps = InputNumberProps & {
  label?: string;
  extra?: ReactNode;
  error?: string;
};

Input.Trade = function (props) {
  return (
    <S.Trade hasError={Boolean(props.error)}>
      {props.label && <S.Label>{props.label}</S.Label>}
      <InputNumber {...props} type="number" step="0.01" />
      {props.extra && <S.Extra>{props.extra}</S.Extra>}
      {props.error && <S.Error type="error" message={props.error} />}
    </S.Trade>
  );
};
// #endregion

const S = {
  Label: styled.h4`
    position: absolute;
    top: -10px;
    left: 10px;
    color: ${(props) => props.theme.input.label.color};
    padding: 0 4px;
    z-index: 1;

    ${(props) => props.theme.snippets.fancy};
  `,
  Trade: styled.div<{ hasError: boolean }>`
    position: relative;

    .ant-input-number {
      width: 100%;
      min-width: 240px;
      max-width: 640px;
      padding: ${(props) =>
        `${props.theme.spacing.tiny} ${props.theme.spacing.small}`};
      border: 1px solid ${(props) => props.theme.input.borderColor};

      ${(props) =>
        props.hasError &&
        css`
          border: 1px solid ${(props) => props.theme.input.error.borderColor};
        `}

      input {
        padding-left: ${(props) => props.theme.spacing.tiny};

        ${(props) =>
          props.hasError &&
          css`
            color: ${(props) => props.theme.input.error.color};
          `}
      }
    }
  `,
  Extra: styled.p`
    font-size: ${(props) => props.theme.fontSizes.tiny};
    text-align: right;

    min-width: 240px;
    max-width: 640px;
  `,
  Error: styled(Alert)`
    min-width: 240px;
    max-width: 640px;
  `,
};
