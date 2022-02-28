import { Card, Space, Typography } from "antd";
import { ExternalLink, Token } from "components/atomic";
import { Link } from "react-router-dom";
import { ReactNode, useCallback, useState } from "react";

export function PortfolioCard({
  showStaking = true,
  walletAmount,
  symbol,
  name,
  walletUsdValue,
  accruedSymbol,
  accruedAmount,
  accruedUsdValue,
  stakingAmount,
  stakingUsdValue,
  link,
  actions,
  extra,
  removeTheN = false,
}: {
  link?: string;
  showStaking?: boolean;
  walletAmount: string;
  walletUsdValue: string;
  accruedSymbol?: string;
  accruedAmount?: string;
  accruedUsdValue?: string;
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
      bordered={false}
      onClick={toggleExpanded}
      title={
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space direction="horizontal" style={{ width: "100%" }}>
            <Token
              symbol={symbolToUse}
              symbolOverride={symbol}
              name={name}
              size="medium"
            />
            {
              link
                ?
                  link.startsWith('https')
                    ? <ExternalLink to={link}>Go To</ExternalLink>
                    : <Link to={link}>Go To</Link>
                : ""
            }
          </Space>
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
          {showStaking && (
            <>
              <Card
                bordered={false}
                type="inner"
                title="Accrued"
                bodyStyle={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Token
                  amount={accruedAmount}
                  symbol={accruedSymbol ?? ""}
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
                  {accruedUsdValue}
                </Typography.Title>
              </Card>
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
                  type="secondary"
                  style={{
                    margin: 0,
                  }}
                >
                  {stakingUsdValue}
                </Typography.Title>
              </Card>
            </>
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
