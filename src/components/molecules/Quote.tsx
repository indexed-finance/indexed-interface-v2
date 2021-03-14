import { HTMLProps } from "react";
import { Typography } from "antd";

export interface Props extends HTMLProps<HTMLDivElement> {
  symbol?: string;
  price: string;
  netChange: string;
  netChangePercent: string;
  isNegative?: boolean;
  kind?: "small" | "normal";
  centered?: boolean;
  inline?: boolean;
}

export default function Quote({
  symbol = "",
  price,
  netChange,
  netChangePercent,
  isNegative = false,
  centered = true,
  inline = false,
}: Props) {
  const inner = (
    <>
      {symbol && (
        <Typography.Title
          level={2}
          style={{
            marginTop: 0,
            marginRight: 12,
            marginBottom: 0,
          }}
        >
          {symbol}
        </Typography.Title>
      )}
      <Typography.Title
        level={3}
        style={{
          marginTop: 0,
          marginRight: 12,
          marginBottom: 0,
        }}
      >
        {price}
      </Typography.Title>
      <Typography.Paragraph
        style={{
          marginTop: 0,
          marginBottom: 0,
        }}
        type={isNegative ? "danger" : "success"}
      >
        {netChange} ({netChangePercent})
      </Typography.Paragraph>
    </>
  );

  return inline ? <div className="flex-center">{inner}</div> : inner;
}
