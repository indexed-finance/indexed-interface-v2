import { Space, Typography } from "antd";
import { StakingWidget } from "components/atomic";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useStakingRegistrar, useTranslator } from "hooks";

export default function Stake() {
  const tx = useTranslator();
  const staking = useSelector(selectors.selectFormattedStaking);

  useStakingRegistrar();

  return (
    <Space direction="vertical">
      <Typography.Title level={3}>{tx("INDEX_TOKENS")}</Typography.Title>
      <Space size="large" wrap={true} align="end">
        {staking.indexTokens.map((stakingPool) => (
          <StakingWidget key={stakingPool.id} {...stakingPool} />
        ))}
      </Space>
      <Typography.Title level={3}>{tx("LIQUIDITY_TOKENS")}</Typography.Title>
      <Space size="large" wrap={true} align="end">
        {staking.liquidityTokens.map((stakingPool) => (
          <StakingWidget key={stakingPool.id} {...stakingPool} />
        ))}
      </Space>
    </Space>
  );
}
