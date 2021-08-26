import { Card, Space, Typography } from "antd";
import { ReactNode, useCallback, useState } from "react";
import { Token } from "components/atomic";

export function PortfolioCard({
  walletAmount,
  symbol,
  name,
  walletUsdValue,
  stakingAmount,
  stakingUsdValue,
  actions,
  extra,
  removeTheN = false,
}: {
  walletAmount: string;
  walletUsdValue: string;
  stakingAmount?: string;
  stakingUsdValue?: string;
  symbol: string;
  name: string;
  actions: ReactNode[];
  extra?: ReactNode;
  removeTheN?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);
  const symbolToUse = removeTheN ? symbol.split("").slice(1).join("") : symbol;

  return (
    <Card
      extra={extra}
      hoverable={true}
      onClick={toggleExpanded}
      title={
        <Space direction="vertical" style={{ width: "100%" }}>
          <Token
            symbol={symbolToUse}
            symbolOverride={symbol}
            name={name}
            size="medium"
          />
          {/* Wallet */}
          <Card
            type="inner"
            bordered={false}
            title="In Wallet"
            bodyStyle={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Token
              amount={walletAmount}
              symbol={symbolToUse}
              symbolOverride={symbol}
              name={name}
              size="small"
              style={{ textAlign: "left" }}
            />
            <Typography.Title
              level={4}
              type="success"
              style={{
                margin: 0,
              }}
            >
              {walletUsdValue}
            </Typography.Title>
          </Card>

          {/* Staking */}
          {stakingAmount && stakingUsdValue && (
            <Card
              bordered={false}
              type="inner"
              title="Staking"
              bodyStyle={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Token
                amount={stakingAmount}
                symbol={symbolToUse}
                symbolOverride={symbol}
                name={name}
                size="small"
                style={{ textAlign: "left" }}
              />
              <Typography.Title
                level={4}
                type="danger"
                style={{
                  margin: 0,
                }}
              >
                {stakingUsdValue}
              </Typography.Title>
            </Card>
          )}
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
