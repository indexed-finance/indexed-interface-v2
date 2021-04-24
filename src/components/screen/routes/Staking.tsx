import { Divider, Space } from "antd";
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
      <Divider orientation="left">{tx("INDEX_TOKENS")}</Divider>
      <Space size="large" wrap={true}>
        {staking.indexTokens.map((stakingPool) => (
          <StakingWidget key={stakingPool.id} {...stakingPool} />
        ))}
      </Space>
      <Divider orientation="left">{tx("LIQUIDITY_TOKENS")}</Divider>

      <Space size="large" wrap={true}>
        {staking.liquidityTokens.map((stakingPool) => (
          <StakingWidget key={stakingPool.id} {...stakingPool} />
        ))}
      </Space>
    </Space>
  );
}
