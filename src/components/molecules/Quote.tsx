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
    <S.Bottom kind={kind}>
      <Typography.Text type={isNegative ? "danger" : "success"}>
        {netChange} ({netChangePercent})
      </Typography.Text>
    </S.Bottom>
  );

  return (
    <div {...rest}>
      {symbol && (
        <S.Top level={3}>
          {symbol} {kind === "normal" && price}
        </S.Top>
      )}
      <S.Middle kind={kind}>
        {kind !== "normal" && price}
        {kind === "small" && bottom}
      </S.Middle>
      {kind !== "small" && bottom}
    </div>
  );
}

const S = {
  Top: styled(Typography.Title)`
    margin: 0;
  `,
  Middle: styled.div<{ kind: Props["kind"] }>`
    font-size: ${(props) => (props.kind === "small" ? "18px" : "28px")};
    margin: 0;
    margin-top: ${(props) => (props.kind === "small" ? "-6px" : "-14px")};

    ${(props) =>
      props.kind === "small" && props.theme.snippets.perfectlyAligned};

    font-size: ${(props) => (props.kind === "small" ? "13px" : "16px")};
  `,
  Bottom: styled.div<{ kind: Props["kind"] }>`
    margin: 0;
    margin-top: ${(props) => (props.kind === "small" ? "0" : "-8px")};
    ${(props) => props.theme.snippets.perfectlyAligned};

    div {
      font-size: ${(props) => (props.kind === "small" ? "13px" : "16px")};
      margin-left: ${(props) =>
        props.kind === "small" ? props.theme.spacing.small : "0"};
    }

    span {
      font-size: ${(props) => (props.kind === "small" ? "13px" : "16px")};
      margin-left: ${(props) => props.theme.spacing.tiny};
    }
  `,
};
