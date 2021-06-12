import { Badge, Card, Col, Row, Typography } from "antd";
import { FormattedNewStakingData } from "features";
import { Link } from "react-router-dom";
import { Token } from "components/atomic/atoms";
import { useMasterChefApy, useNewStakingApy, useStakingApy } from "hooks";
import noop from "lodash.noop";

interface Props
  extends Omit<FormattedNewStakingData, "indexPool" | "rewardsPerDay"> {
  linkPath?: string;
  indexPool?: string;
  rewardsPerDay?: string;
  backdrop?: string;
  badge?: string;
  badgeColor?: string;
  useApy?: any;
}

export function StakingCard({
  id,
  name,
  symbol,
  rewardsPerDay,
  totalStaked,
  backdrop,
  badge,
  badgeColor,
  linkPath,
  useApy = noop,
}: Props) {
  const apy = useApy(id);

  const inner = (
    <Link to={`/${linkPath}/${id}`}>
      <Card
        key={id}
        bordered={true}
        hoverable={true}
        style={{ marginTop: 24, position: "relative", overflow: "hidden" }}
        title={
          <Row gutter={24}>
            <Col span={6}>{name}</Col>
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
          <Col span={6}>
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
          <Col span={3} style={{ textAlign: "right" }}>
            <Typography.Title level={2} type="success" style={{ margin: 0 }}>
              {apy ?? "wat"}
            </Typography.Title>
          </Col>
        </Row>

        {backdrop && (
          <img
            src={backdrop}
            alt="Backdrop"
            style={{
              position: "absolute",
              bottom: -34,
              right: -34,
              width: 128,
              height: 128,
              opacity: 0.2,
            }}
          />
        )}
      </Card>
    </Link>
  );

  return badge ? (
    <Badge.Ribbon color={badgeColor} text={badge}>
      {inner}
    </Badge.Ribbon>
  ) : (
    inner
  );
}

// Variants
export function UniswapStakingCard(props: Props) {
  return (
    <StakingCard
      {...props}
      linkPath="staking-new"
      badge="Uniswap LP"
      badgeColor="pink"
      backdrop={require("images/uni.png").default}
      useApy={useNewStakingApy}
    />
  );
}

export function SushiswapStakingCard(props: Props) {
  return (
    <StakingCard
      {...props}
      linkPath="stake-sushi"
      badge="Sushiswap LP"
      badgeColor="violet"
      backdrop={require("images/sushi.png").default}
      useApy={useMasterChefApy}
    />
  );
}

export function ExpiredStakingCard(props: Props) {
  return (
    <StakingCard
      {...props}
      linkPath="staking"
      badge="Expired"
      badgeColor="red"
      useApy={useStakingApy}
    />
  );
}
