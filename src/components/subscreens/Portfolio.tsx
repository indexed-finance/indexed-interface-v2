import { Col, Divider, Row, Space, Typography } from "antd";
import { Progress, Token } from "components/atomic/atoms";
import { useMemo } from "react";
import { usePortfolioData } from "hooks/portfolio-hooks";

export default function Portfolio() {
  const { ndx, tokens } = usePortfolioData();
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);

  return (
    <Row gutter={[40, 40]}>
      {data.map((holding) => (
        <Col key={holding.address} span={12}>
          <div
            className="darkened bordered"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
            }}
          >
            <Space direction="vertical" style={{ flex: 2 }}>
              <Space size="large">
                <Token
                  name={holding.name}
                  image={holding.image}
                  symbol={holding.symbol}
                  amount={holding.balance}
                  size="medium"
                />
                <Typography.Text
                  type="success"
                  style={{ flex: 1, fontSize: 24 }}
                >
                  {holding.value}
                </Typography.Text>
              </Space>
              {((holding.ndxEarned && holding.ndxEarned !== "0.00") ||
                holding.staking) && (
                <Space size="small">
                  {holding.ndxEarned && holding.ndxEarned !== "0.00" && (
                    <>
                      Earned{" "}
                      <Token
                        name="indexed-dark"
                        image=""
                        address={ndx.address}
                        symbol={ndx.symbol}
                        amount={holding.ndxEarned}
                        size="tiny"
                      />
                    </>
                  )}
                  {holding.staking && (
                    <>
                      <Divider type="vertical" />
                      Staking{" "}
                      <Token
                        name=""
                        image=""
                        address={holding.address}
                        symbol={holding.symbol}
                        amount={holding.ndxEarned}
                        size="tiny"
                      />
                    </>
                  )}
                </Space>
              )}
            </Space>
            <Progress
              style={{ flex: 1, fontSize: 24, textAlign: "right" }}
              width={90}
              status="active"
              type="dashboard"
              percent={parseFloat(holding.weight.replace(/%/g, ""))}
            />
          </div>
        </Col>
      ))}
    </Row>
  );
}
