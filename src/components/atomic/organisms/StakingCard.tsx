import { Badge, Card, Col, Row, Spin, Typography } from "antd";
import { FormattedNewStakingData } from "features";
import { Label, Token } from "components/atomic/atoms";
import { Link } from "react-router-dom";
import {
  useBreakpoints,
  useMasterChefApy,
  useNewStakingApy,
  useStakingApy,
} from "hooks";
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
  earned,
  staked,
  rewardsPerDay,
  totalStaked,
  backdrop,
  badge,
  badgeColor,
  linkPath,
  useApy = noop,
}: Props) {
  const { lg } = useBreakpoints();
  const apy = useApy(id);
  const token = (
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
  );
  const inner = (
    <Link to={`/${linkPath}/${id}`}>
      <Card
        key={id}
        bordered={true}
        hoverable={true}
        style={{ marginTop: 24, position: "relative", overflow: "hidden" }}
        title={
          lg ? (
            <Row gutter={24}>
              <Col xs={24} sm={6}>
                {name}
              </Col>
              <Col xs={24} sm={5}>
                {!["0.00 NDX", "0.00 SUSHI"].includes(earned) && (
                  <em>
                    <Typography.Text type="success">
                      Earned {earned}
                    </Typography.Text>
                  </em>
                )}
              </Col>
              <Col xs={24} sm={5}>
                {staked !== "0.00" && (
                  <em>
                    <Typography.Text type="success">
                      Staking {staked} {symbol}
                    </Typography.Text>
                  </em>
                )}
              </Col>
            </Row>
          ) : (
            token
          )
        }
      >
        <Row gutter={24} align="middle">
          {/* CC10 */}
          <Col xs={24} lg={6} style={{ marginBottom: lg ? 12 : 0 }}>
            {!lg ? name : token}
          </Col>

          {/* 200 NDX/Day */}
          <Col xs={24} lg={5} style={{ marginBottom: lg ? 12 : 0 }}>
            {!lg && <Label>Rewards Per Day</Label>}
            <Typography.Title level={3} style={{ margin: 0 }}>
              {rewardsPerDay}
            </Typography.Title>
          </Col>

          {/* 12,000.00 UNI */}
          <Col xs={24} lg={6} style={{ marginBottom: lg ? 12 : 0 }}>
            {!lg && <Label>Total Staked</Label>}
            <Typography.Title level={3} style={{ margin: 0 }}>
              {totalStaked} {symbol}
            </Typography.Title>
          </Col>

          {/* 13.37% APY */}
          <Col xs={24} lg={4} style={{ textAlign: lg ? "right" : "left" }}>
            {!lg && <Label>APR</Label>}
            <Typography.Title level={2} type="success" style={{ margin: 0 }}>
              {apy ?? <Spin />}
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

export function SingleSidedStakingCard(props: Props) {
  return (
    <StakingCard
      {...props}
      linkPath="staking-new"
      badge=""
      badgeColor=""
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
