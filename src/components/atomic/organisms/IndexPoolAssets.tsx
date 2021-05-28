import { Card, Col, List, Row, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Progress, Quote, Token } from "components/atomic";
import { useBreakpoints } from "hooks";

export function IndexPoolAssets({ assets }: FormattedIndexPool) {
  const { isMobile } = useBreakpoints();

  return (
    <Card
      bodyStyle={{ maxWidth: 450 }}
      title={
        <Typography.Title level={3} style={{ margin: 0 }}>
          Assets
        </Typography.Title>
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
                  style={{ width: "100%", marginRight: 0 }}
                />
              </Col>
              <Col span={6}>
                <Progress
                  style={{ flex: 1, textAlign: "right" }}
                  width={isMobile ? 60 : 80}
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
