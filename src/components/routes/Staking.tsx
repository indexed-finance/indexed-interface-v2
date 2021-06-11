import { Alert, Col, Collapse, Menu, Row, Typography } from "antd";
import { MasterChefStakingWidget } from "components/atomic/organisms/MasterChefWidget";
import { Page, StakingWidget } from "components/atomic";
import { StakingWidgetNew } from "components/atomic/organisms/StakingWidgetNew";
import { selectors } from "features";
import {
  useBreakpoints,
  useNewStakingRegistrar,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useMasterChefRegistrar } from "hooks/masterchef-hooks";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function Stake() {
  const tx = useTranslator();
  const stakingDetail = useSelector(selectors.selectFormattedStaking);
  const newStakingDetail = useSelector(selectors.selectNewFormattedStaking);
  const masterChefDetail = useSelector(selectors.selectMasterChefFormattedStaking)
  const { isMobile } = useBreakpoints();
  const [showing, setShowing] = useState<"active" | "expired">("active");

  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  return (
    <Page
      hasPageHeader={true}
      title={
        <>
          <Typography.Title level={isMobile ? 5 : 2}>
            {tx("LIQUIDITY_MINING")}
          </Typography.Title>
        </>
      }
    >
      <Menu
        mode="horizontal"
        activeKey={showing}
        onClick={({ key }) => setShowing(key as "active" | "expired")}
        style={{ marginBottom: 24 }}
      >
        <Menu.Item key="active">Active</Menu.Item>
        <Menu.Item key="expired">Expired</Menu.Item>
      </Menu>
      {showing === "active" && (
        <>
          <Alert
            type="success"
            showIcon={true}
            icon={
              <img
                alt="NDX"
                src={require("images/indexed.png").default}
                style={{ width: 24, height: 24 }}
              />
            }
            message="Earn NDX"
            description="Stake index tokens or their associated liquidity tokens to earn NDX, the governance token for Indexed."
            style={{ marginBottom: 24 }}
          />
          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Collapse defaultActiveKey="index">
                <Collapse.Panel
                  key="index"
                  header={tx("INDEX_TOKENS")}
                  style={{ marginBottom: 24 }}
                >
                  <Row gutter={20}>
                    {newStakingDetail.indexTokens.map((stakingPool) => (
                      <Col
                        key={stakingPool.id}
                        span={24}
                        style={{ marginBottom: 24 }}
                      >
                        <StakingWidgetNew {...stakingPool} />
                      </Col>
                    ))}
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Col>
            <Col xs={24} sm={12}>
              <Collapse defaultActiveKey="liquidity">
                <Collapse.Panel key="liquidity" header={tx("LIQUIDITY_TOKENS")}>
                  {newStakingDetail.liquidityTokens.map((stakingPool) => (
                    <Col
                      key={stakingPool.id}
                      span={24}
                      style={{ marginBottom: 24 }}
                    >
                      <StakingWidgetNew {...stakingPool} />
                    </Col>
                  ))}
                  {masterChefDetail.map((stakingPool) =>
                    <Col
                    key={stakingPool.id}
                    span={24}
                    style={{ marginBottom: 24 }}
                  >
                    <MasterChefStakingWidget {...stakingPool} />
                  </Col>
                  )}
                </Collapse.Panel>
              </Collapse>
            </Col>
          </Row>
        </>
      )}
      {showing === "expired" && (
        <>
          <Alert
            type="error"
            showIcon={true}
            message="These pools have expired."
            description="Withdraw your tokens immediately."
            style={{ marginBottom: 24 }}
          />
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Collapse defaultActiveKey="index">
                <Collapse.Panel key="index" header={tx("INDEX_TOKENS")}>
                  {stakingDetail.indexTokens.map((stakingPool) => (
                    <Col
                      key={stakingPool.id}
                      span={24}
                      style={{ marginBottom: 24 }}
                    >
                      <StakingWidget key={stakingPool.id} {...stakingPool} />
                    </Col>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </Col>
            <Col xs={24} md={12}>
              <Collapse defaultActiveKey="liquid">
                <Collapse.Panel key="liquid" header={tx("LIQUIDITY_TOKENS")}>
                  {stakingDetail.liquidityTokens
                    .filter((t) => t.expired)
                    .map((stakingPool) => (
                      <Col
                        key={stakingPool.id}
                        span={24}
                        style={{ marginBottom: 24 }}
                      >
                        <StakingWidget key={stakingPool.id} {...stakingPool} />
                      </Col>
                    ))}
                </Collapse.Panel>
              </Collapse>
            </Col>
          </Row>
        </>
      )}
    </Page>
  );
}
