import { ReactNode } from "react";
import { Typography } from "antd";

export function PortfolioSection({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <Typography.Title
        level={1}
        type="warning"
        style={{ textTransform: "uppercase" }}
      >
        {title}
      </Typography.Title>

      {children}
    </div>
  );
}
