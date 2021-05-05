import { Card, List, Space, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Progress, Quote, Token } from "components/atomic";

export function IndexPoolAssets({ assets }: FormattedIndexPool) {
  return (
    <Card
      bodyStyle={{ maxWidth: 450 }}
      title={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Assets
          </Typography.Title>
          <Typography.Text type="secondary">
            <em>Total of {assets.length}</em>
          </Typography.Text>
        </Space>
      }
    >
      <List>
        {assets.map((asset) => (
          <List.Item key={asset.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Token
                  name={asset.name}
                  address={asset.id}
                  symbol={asset.symbol}
                  amount={asset.balance}
                  size="small"
                />
                <Typography.Text type="success">
                  {asset.balanceUsd}
                </Typography.Text>
              </div>
              <div
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Quote
                  price={asset.price}
                  netChange={asset.netChange}
                  netChangePercent={asset.netChangePercent}
                  textSize="small"
                />
              </div>
              <Progress
                style={{ flex: 1, textAlign: "right" }}
                width={80}
                status="active"
                type="dashboard"
                percent={parseFloat(asset.weightPercentage.replace(/%/g, ""))}
              />
            </div>
          </List.Item>
        ))}
      </List>
    </Card>
  );
}
