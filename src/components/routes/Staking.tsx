import { Alert, Card, Space, Typography } from "antd";
import { Page, StakingWidget } from "components/atomic";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useStakingRegistrar, useTranslator } from "hooks";

export default function Stake() {
  const tx = useTranslator();
  const { indexTokens, liquidityTokens } = useSelector(
    selectors.selectFormattedStaking
  );

  useStakingRegistrar();

  return (
    <Page hasPageHeader={true} title={tx("LIQUIDITY_MINING")}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Alert
          type="info"
          message={
            <span style={{ fontSize: 18 }}>{tx("STAKE_INDEX_TOKENS_...")}</span>
          }
        />
        {indexTokens.length > 0 && (
          <Card
            title={
              <Typography.Title level={3}>
                {tx("INDEX_TOKENS")}
              </Typography.Title>
            }
          >
            <Space size="large" wrap={true}>
              {indexTokens.map((stakingPool) => (
                <StakingWidget key={stakingPool.id} {...stakingPool} />
              ))}
            </Space>
          </Card>
        )}
        {indexTokens.length > 0 && (
          <Card
            title={
              <Typography.Title level={3}>
                {tx("LIQUIDITY_TOKENS")}
              </Typography.Title>
            }
          >
            <Space size="large" wrap={true}>
              {liquidityTokens.map((stakingPool) => (
                <StakingWidget key={stakingPool.id} {...stakingPool} />
              ))}
            </Space>
          </Card>
        )}
      </Space>
    </Page>
  );
}
