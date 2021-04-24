import { Divider, Space, Typography } from "antd";
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
      <Divider orientation="left">
        <Typography.Title style={{ margin: 0 }} level={3}>
          {tx("INDEX_TOKENS")}
        </Typography.Title>
      </Divider>
      <Space size="large" wrap={true}>
        {staking.indexTokens.map((stakingPool) => (
          <StakingWidget key={stakingPool.id} {...stakingPool} />
        ))}
      </Space>
      <Divider orientation="left">
        <Typography.Title style={{ margin: 0 }} level={3}>
          {tx("LIQUIDITY_TOKENS")}
        </Typography.Title>
      </Divider>
      <Space size="large" wrap={true}>
        {staking.liquidityTokens.map((stakingPool) => (
          <StakingWidget key={stakingPool.id} {...stakingPool} />
        ))}
      </Space>
    </Space>
  );
}
