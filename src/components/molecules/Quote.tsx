import { HTMLProps } from "react";
import { Typography } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";

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
  const theme = useSelector(selectors.selectTheme);
  const bottom = (
    <div>
      <Typography.Text type={isNegative ? "danger" : "success"}>
        {netChange} ({netChangePercent})
      </Typography.Text>
    </div>
  );

  return (
    <div {...rest}>
      {symbol && (
        <Typography.Title level={3}>
          <span style={{ color: theme === "dark" ? "#ccccff" : "#4D4D80" }}>
            {symbol}
          </span>{" "}
          {kind === "normal" && price}
        </Typography.Title>
      )}
      <div>
        {kind !== "normal" && price}
        {kind === "small" && bottom}
      </div>
      {kind !== "small" && bottom}
    </div>
  );
}
