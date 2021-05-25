import { Alert, Col, Row, Space, Typography } from "antd";
import { Page, StakingWidget } from "components/atomic";
import { StakingWidgetNew } from "components/atomic/organisms/StakingWidgetNew";
import { selectors } from "features";
import { useEffect } from "react";
import {
  useNewStakingRegistrar,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";

export default function Stake() {
  const tx = useTranslator();
  const stakingDetail = useSelector(selectors.selectFormattedStaking);
  const newStakingDetail = useSelector(selectors.selectNewFormattedStaking);

  useEffect(() => {
    console.log("new stake");
    console.log(newStakingDetail);
  }, [newStakingDetail]);

  useStakingRegistrar();
  useNewStakingRegistrar();

  return (
    <Page hasPageHeader={true} title={tx("LIQUIDITY_MINING")}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Alert
          type="info"
          message={
            <span style={{ fontSize: 18 }}>{tx("STAKE_INDEX_TOKENS_...")}</span>
          }
        />
        {newStakingDetail.indexTokens.length > 0 && (
          <>
            <Typography.Title level={3}>{tx("INDEX_TOKENS")}</Typography.Title>
            <Row gutter={[20, 20]}>
              {newStakingDetail.indexTokens.map((stakingPool) => (
                <Col span={12} key={stakingPool.id}>
                  <StakingWidgetNew key={stakingPool.id} {...stakingPool} />
                </Col>
              ))}
            </Row>
          </>
        )}
        {newStakingDetail.liquidityTokens.length > 0 && (
          <>
            <Typography.Title level={3}>
              {tx("LIQUIDITY_TOKENS")}
            </Typography.Title>
            <Row gutter={[20, 20]}>
              {newStakingDetail.liquidityTokens.map((stakingPool) => (
                <Col span={12} key={stakingPool.id}>
                  <StakingWidgetNew key={stakingPool.id} {...stakingPool} />
                </Col>
              ))}
              {stakingDetail.liquidityTokens
                .filter((t) => !t.expired)
                .map((stakingPool) => (
                  <Col span={12} key={stakingPool.id}>
                    <StakingWidget key={stakingPool.id} {...stakingPool} />
                  </Col>
                ))}
            </Row>
          </>
        )}
      </Space>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", marginTop: 15 }}
      >
        <Alert
          type="warning"
          message={<span style={{ fontSize: 18 }}>Expired Staking Pools</span>}
        />
        {stakingDetail.indexTokens.length > 0 && (
          <>
            <Typography.Title level={3}>{tx("INDEX_TOKENS")}</Typography.Title>
            <Row gutter={[20, 20]}>
              {stakingDetail.indexTokens.map((stakingPool) => (
                <Col span={12} key={stakingPool.id}>
                  <StakingWidget key={stakingPool.id} {...stakingPool} />
                </Col>
              ))}
            </Row>
          </>
        )}
        {stakingDetail.liquidityTokens.length > 0 && (
          <>
            <Typography.Title level={3}>
              {tx("LIQUIDITY_TOKENS")}
            </Typography.Title>
            <Row gutter={[20, 20]}>
              {stakingDetail.liquidityTokens
                .filter((t) => t.expired)
                .map((stakingPool) => (
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
