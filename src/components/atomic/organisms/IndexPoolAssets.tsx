import { Card, Col, List, Row, Space, Typography } from "antd";
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
            <Row gutter={24}>
              <Col span={10}>
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
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                <Quote
                  price={asset.price}
                  netChange={asset.netChange}
                  netChangePercent={asset.netChangePercent}
                  textSize="small"
                  textAlign="right"
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={6}>
                <Progress
                  style={{ flex: 1, textAlign: "right" }}
                  width={80}
                  status="active"
                  type="dashboard"
                  percent={parseFloat(asset.weightPercentage.replace(/%/g, ""))}
                />
              </Col>
            </Row>
          </List.Item>
        ))}
      </List>
    </Card>
  );
}
