import { Card, Col, List, Row, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Progress, Token } from "components/atomic/atoms";
import { useBreakpoints } from "hooks";

export function IndexPoolAssets({ assets }: FormattedIndexPool) {
  const { isMobile } = useBreakpoints();

  return (
    <Card
      title={
        <Typography.Title level={3} style={{ margin: 0 }}>
          Assets
        </Typography.Title>
      }
    >
      <List style={{ width: "100%" }}>
        {assets.map((asset) => (
          <List.Item key={asset.id} style={{ width: "100%" }}>
            <Row gutter={24} align="middle" style={{ width: "100%" }}>
              <Col xs={24} md={18}>
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
              <Col xs={24} md={6}>
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
