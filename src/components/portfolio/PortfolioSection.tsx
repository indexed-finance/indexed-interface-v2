import { Divider, Typography } from "antd";
import { ReactNode } from "react";

export function PortfolioSection({
  title,
  usdValue,
  children,
}: {
  title: ReactNode;
  usdValue: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <Typography.Title
        level={1}
        type="warning"
        style={{ margin: 0, textTransform: "uppercase" }}
      >
        {title}
      </Typography.Title>
      <Divider orientation="right">
        <Typography.Title
          level={3}
          type="success"
          style={{ textAlign: "right", margin: 0 }}
        >
          {usdValue}
        </Typography.Title>
      </Divider>

      {children}
    </div>
  );
}
