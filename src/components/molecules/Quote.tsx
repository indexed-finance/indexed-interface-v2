import { HTMLProps } from "react";
import { Typography } from "antd";

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
}: Props) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <Typography.Title level={2} className="no-margin">
        {symbol}
      </Typography.Title>
      <Typography.Title level={3} className="no-margin">
        {price}
      </Typography.Title>
      <Typography.Paragraph
        className="no-margin"
        type={isNegative ? "danger" : "success"}
      >
        {netChange} ({netChangePercent})
      </Typography.Paragraph>
    </div>
  );
}
