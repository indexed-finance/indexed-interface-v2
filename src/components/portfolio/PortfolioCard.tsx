import { Card, Space, Typography } from "antd";
import { ReactNode, useCallback, useState } from "react";
import { Token } from "components/atomic";

export function PortfolioCard({
  amount,
  symbol,
  name,
  usdValue,
  actions,
  extra,
}: {
  amount: string;
  symbol: string;
  name: string;
  usdValue: string;
  actions: ReactNode[];
  extra?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <Card
      extra={extra}
      hoverable={true}
      onClick={toggleExpanded}
      title={
        <Space direction="vertical" style={{ width: "100%" }}>
          <Token amount={amount} symbol={symbol} name={name} size="large" />
          <Typography.Title level={4} type="success" style={{ margin: 0 }}>
            {usdValue}
          </Typography.Title>
        </Space>
      }
      bodyStyle={{
        display: expanded ? undefined : "none",
      }}
    >
      {expanded && actions}
    </Card>
  );
}
