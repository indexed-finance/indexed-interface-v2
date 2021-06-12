import { Card, Col, Row, Typography } from "antd";
import { FormattedNewStakingData } from "features";
import { Link } from "react-router-dom";
import { Token } from "components/atomic/atoms";
import { useNewStakingApy } from "hooks";

interface Props
  extends Omit<FormattedNewStakingData, "indexPool" | "rewardsPerDay"> {
  indexPool?: string;
  rewardsPerDay?: string;
}

export function StakingCard({
  id,
  name,
  symbol,
  rewardsPerDay,
  totalStaked,
}: Props) {
  const apy = useNewStakingApy(id);

  return (
    <Link to={`/staking-new/${id}`}>
      <Card
        key={id}
        bordered={true}
        hoverable={true}
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
          </Row>
        }
      >
        <Row gutter={24} align="middle">
          {/* CC10 */}
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

          {/* 200 NDX/Day */}
          <Col span={5}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {rewardsPerDay}
            </Typography.Title>
          </Col>

          {/* 12,000.00 UNI */}
          <Col span={7}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {totalStaked} {symbol}
            </Typography.Title>
          </Col>

          {/* 13.37% APY */}
          <Col span={3}>
            <Typography.Title level={2} type="success" style={{ margin: 0 }}>
              {apy}
            </Typography.Title>
          </Col>
        </Row>
      </Card>
    </Link>
  );
}
