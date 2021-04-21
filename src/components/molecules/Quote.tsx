import { HTMLProps } from "react";
import { Skeleton, Spin, Typography } from "antd";
import { useBreakpoints } from "hooks";

interface Props extends HTMLProps<HTMLDivElement> {
  symbol?: string;
  price: string;
  netChange: string;
  netChangePercent: string;
  isNegative?: boolean;
  kind?: "small" | "normal";
  centered?: boolean;
  inline?: boolean;
}

export function Quote({
  symbol = "",
  price,
  netChange,
  netChangePercent,
  isNegative = false,
  inline = false,
  centered = false,
}: Props) {
  const { isMobile } = useBreakpoints();
  const inner = (
    <>
      {symbol && (
        <Typography.Title
          level={isMobile ? 4 : 2}
          style={{
            marginTop: 0,
            marginRight: 12,
            marginBottom: 0,
            justifyContent: centered ? "center" : "left",
          }}
        >
          {symbol}
        </Typography.Title>
      )}
      {price && netChange && netChangePercent ? (
        <>
          <Typography.Title
            level={isMobile ? 5 : 3}
            style={{
              opacity: 0.75,
              marginTop: 0,
              marginRight: 12,
              marginBottom: 0,
              justifyContent: centered ? "center" : "left",
              textAlign: centered ? "center" : "initial",
            }}
          >
            {price ?? <Skeleton paragraph={{ rows: 1 }} />}
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
      ) : (
        <Spin size="large" />
      )}
    </>
  );

  return (
    <div>
      {inline || centered ? (
        <div
          className={centered ? "perfectly-centered" : "flex-center"}
          style={{
            display: inline ? "flex" : "block",
            alignItems: "center",
          }}
        >
          {inner}
        </div>
      ) : (
        inner
      )}
    </div>
  );
}
