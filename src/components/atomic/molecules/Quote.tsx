import { HTMLProps } from "react";
import { Space, Spin, Typography } from "antd";
import { useBreakpoints } from "hooks";

interface Props extends HTMLProps<HTMLDivElement> {
  name?: string;
  symbol?: string;
  price?: string;
  netChange?: string;
  netChangePercent?: string;
  kind?: "small" | "normal";
  centered?: boolean;
  inline?: boolean;
}

export function Quote({
  name = "",
  symbol = "",
  price = "",
  netChange = "",
  netChangePercent = "",
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
          {name && (
            <>
              <br />
              {name}
            </>
          )}
        </Typography.Title>
      )}
      {price || netChange || netChangePercent ? (
        <Space>
          {price && (
            <Typography.Title
              level={3}
              style={{
                opacity: 0.75,
                marginTop: 0,
                marginRight: 12,
                marginBottom: 0,
                justifyContent: centered ? "center" : "left",
                textAlign: centered ? "center" : "initial",
              }}
            >
              {price}
            </Typography.Title>
          )}
          {(netChange || netChangePercent) && (
            <Typography.Title
              level={4}
              style={{
                margin: 0,
              }}
              type={
                netChange.includes("-") || netChangePercent.includes("-")
                  ? "danger"
                  : "success"
              }
            >
              {netChange} {netChangePercent && `(${netChangePercent})`}
            </Typography.Title>
          )}
        </Space>
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
