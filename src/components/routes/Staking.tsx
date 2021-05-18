import { Alert, Col, Row, Space, Typography } from "antd";
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
          <>
            <Typography.Title level={3}>{tx("INDEX_TOKENS")}</Typography.Title>
            <Row gutter={[20, 20]}>
              {indexTokens.map((stakingPool) => (
                <Col span={12} key={stakingPool.id}>
                  <StakingWidget key={stakingPool.id} {...stakingPool} />
                </Col>
              ))}
            </Row>
          </>
        )}
        {indexTokens.length > 0 && (
          <>
            <Typography.Title level={3}>
              {tx("LIQUIDITY_TOKENS")}
            </Typography.Title>
            <Row gutter={[20, 20]}>
              {liquidityTokens.map((stakingPool) => (
                <Col span={12} key={stakingPool.id}>
                  <StakingWidget key={stakingPool.id} {...stakingPool} />
                </Col>
              ))}
            </Row>
          </>
        )}
      </Space>
    </Page>
  );
}
