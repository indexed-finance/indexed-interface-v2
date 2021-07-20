import { Button, Col, Descriptions, Row } from "antd";
import {
  FormattedPortfolioAsset,
  MasterChefPool,
  NewStakingPool,
} from "features";
import { ReactNode, useMemo } from "react";
import { convert } from "helpers";

export function StakingStats({
  decimals,
  symbol,
  portfolioToken,
  stakingPool,
  poolLink,
  stakingPoolLink,
  rewardsPerDay,
  rewardsAsset,
  onExit,
  onClaim,
}: {
  decimals: number;
  symbol: string;
  portfolioToken: FormattedPortfolioAsset;
  stakingPool: NewStakingPool | MasterChefPool;
  poolLink: ReactNode;
  stakingPoolLink: ReactNode;
  rewardsPerDay: string;
  rewardsAsset: string;
  onExit(): void;
  onClaim(): void;
}) {
  const [staked, earned] = useMemo(() => {
    let staked = stakingPool.userStakedBalance;
    let earned = stakingPool.userEarnedRewards;
    staked = staked
      ? convert.toBalance(staked, portfolioToken.decimals, false, 10)
      : "0";
    earned = earned
      ? convert.toBalance(earned, portfolioToken.decimals, false, 10)
      : "0";

    return [staked, earned];
  }, [stakingPool, portfolioToken.decimals]);

  return (
    <Descriptions bordered={true} column={1}>
      {/* Left Column */}
      {parseFloat(staked) > 0 && (
        <Descriptions.Item label="Staked">
          <Row>
            <Col xs={24} md={14}>
              {staked} {symbol}
            </Col>
            <Col xs={24} md={8}>
              <Button danger type="primary" block={true} onClick={onExit}>
                Exit
              </Button>
            </Col>
          </Row>
        </Descriptions.Item>
      )}
      {parseFloat(earned) > 0 && (
        <Descriptions.Item label="Earned Rewards">
          <Row>
            <Col xs={24} md={14}>
              {earned} NDX
            </Col>
            <Col xs={24} md={8}>
              <Button type="primary" block={true} onClick={onClaim}>
                Claim
              </Button>
            </Col>
          </Row>
        </Descriptions.Item>
      )}

      <Descriptions.Item label="Reward Rate per Day">
        {`${convert.toBalance(rewardsPerDay, 18)} ${rewardsAsset}`}
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">{poolLink}</Descriptions.Item>

      {/* Right Column */}
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingPool.totalStaked, decimals, true)} {symbol}
      </Descriptions.Item>

      <Descriptions.Item label="Staking Token">
        {stakingPoolLink}
      </Descriptions.Item>
    </Descriptions>
  );
}
