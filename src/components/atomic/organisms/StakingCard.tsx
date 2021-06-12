import { Button, Card, Col, Row, Space, Typography } from "antd";
import { FaTractor } from "react-icons/fa";
import { FormattedNewStakingData } from "features";
import { Link } from "react-router-dom";
import { Token } from "components/atomic/atoms";
import { useTranslator } from "hooks";

export function StakingCard({
  id,
  name,
  symbol,
  rewardsPerDay,
  totalStaked,
}: FormattedNewStakingData) {
  const tx = useTranslator();

  return (
    <Card
      key={id}
      bordered={true}
      style={{ marginTop: 24 }}
      title={
        <Row gutter={24}>
          <Col span={9}>{name}</Col>
          <Col span={5}>
            <em>
              <Typography.Text type="success">
                Earned 123.00 NDX
              </Typography.Text>
            </em>
          </Col>
          <Col span={5}>
            <em>
              <Typography.Text type="success">
                Staking 12.00 {symbol}
              </Typography.Text>
            </em>
          </Col>
          <Col span={5}>13.37%</Col>
        </Row>
      }
    >
      <Row gutter={24} align="middle">
        <Col span={9}>
          <Token
            name={symbol}
            address={id}
            symbol={symbol}
            symbolOverride={
              ["UNIV2:", "SUSHI:"].some((prefix) => symbol.startsWith(prefix))
                ? symbol.split(":")[1].replace(/-/g, "/")
                : symbol
            }
            size="medium"
            style={{ marginRight: 24 }}
          />
        </Col>
        <Col span={5}>{rewardsPerDay}</Col>
        <Col span={5}>
          {totalStaked} {symbol}
        </Col>
        <Col span={5}>
          <Button
            type={"primary"}
            size="large"
            onClick={(event) => event.stopPropagation()}
          >
            <Link to={`/staking-new/${id}`}>
              <Space>
                <FaTractor style={{ position: "relative", top: 2 }} />
                <span>{tx("STAKE")}</span>
              </Space>
            </Link>
          </Button>
        </Col>
      </Row>
    </Card>
  );
}
