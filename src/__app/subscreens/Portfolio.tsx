import { Card, Col, Divider, List, Row, Space, Typography } from "antd";
import { FaTractor } from "react-icons/fa";
import { Progress, Token } from "components/atoms";
import { useMemo } from "react";
import { usePortfolioData } from "hooks/portfolio-hooks";
import { useTranslator } from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  const { ndx, tokens } = usePortfolioData();
  const data = useMemo(
    () =>
      [ndx, ...tokens].map((t) => ({
        ...t,
        staking: "0.05",
        ndxEarned: "0.05",
      })),
    [ndx, tokens]
  );

  return (
    <Row gutter={[80, 40]}>
      {data.map((holding) => (
        <Col key={holding.address} span={12}>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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

  return (
    <Card>
      <Space wrap={true} size="large" style={{ width: "100%" }}></Space>
    </Card>
  );

  return (
    <List
      size="small"
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <div
            className="colored-text"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "50%",
            }}
          >
            <Space direction="vertical" style={{ flex: 1 }}>
              <Token
                name={item.name}
                image={item.image}
                symbol={item.symbol}
                amount={item.balance}
                size="large"
              />
              {item.ndxEarned && item.ndxEarned !== "0.00" && (
                <Typography.Text type="secondary">
                  {tx("EARNED_X_NDX", {
                    __x: item.ndxEarned,
                  })}
                </Typography.Text>
              )}
              {item.staking && (
                <Typography.Text type="secondary">
                  <Space size="small">
                    <FaTractor />
                    <em>
                      {tx("STAKING_X_Y", {
                        __x: item.staking,
                        __y: item.symbol,
                      })}
                    </em>
                  </Space>
                </Typography.Text>
              )}
            </Space>

            <Typography.Text
              type="success"
              style={{ flex: 1, fontSize: 24, textAlign: "right" }}
            >
              {item.value}
            </Typography.Text>
          </div>
        </List.Item>
      )}
    />
  );
}
