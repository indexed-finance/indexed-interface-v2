import { Typography } from "antd";
import React, { HTMLProps } from "react";
import styled from "styled-components";

export interface Props extends HTMLProps<HTMLDivElement> {
  symbol?: string;
  price: string;
  netChange: string;
  netChangePercent: string;
  isNegative?: boolean;
  kind?: "small" | "normal";
}

export default function Quote({
  symbol = "",
  price,
  netChange,
  netChangePercent,
  isNegative = false,
  kind = "normal",
  ...rest
}: Props) {
  const bottom = (
    <S.Bottom negative={isNegative} kind={kind}>
      <div>
        {netChange} ({netChangePercent})
      </div>
      <span>Today</span>
    </S.Bottom>
  );

  return (
    <div {...rest}>
      {symbol && <S.Top level={2}>{symbol}</S.Top>}
      <S.Middle kind={kind}>
        {price}
        {kind === "small" && bottom}
      </S.Middle>
      {kind === "normal" && bottom}
    </div>
  );
}

const S = {
  Top: styled(Typography.Title)`
    margin: 0;
  `,
  Middle: styled.div<{ kind: Props["kind"] }>`
    font-size: ${(props) => (props.kind === "small" ? "20px" : "32px")};
    margin: 0;
    margin-top: ${(props) => (props.kind === "small" ? "-6px" : "-14px")};
    color: black;

    ${(props) =>
      props.kind === "small" && props.theme.snippets.perfectlyAligned};
  `,
  Bottom: styled.div<{ negative: boolean; kind: Props["kind"] }>`
    margin: 0;
    margin-top: ${(props) => (props.kind === "small" ? "0" : "-8px")};
    ${(props) => props.theme.snippets.perfectlyAligned};

    div {
      color: ${(props) => (props.negative ? "red" : "green")};
      font-size: ${(props) => (props.kind === "small" ? "16px" : "18px")};
      margin-left: ${(props) =>
        props.kind === "small" ? props.theme.spacing.small : "0"};
    }

    span {
      font-size: ${(props) => (props.kind === "small" ? "16px" : "18px")};
      color: ${(props) => props.theme.colors.grey100};
      margin-left: ${(props) => props.theme.spacing.tiny};
    }
  `,
};
