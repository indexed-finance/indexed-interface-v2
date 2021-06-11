import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Menu,
  Row,
  Space,
  Typography,
} from "antd";
import { FaTractor } from "react-icons/fa";
import { FcExpired } from "react-icons/fc";
import { ImCheckmark2 } from "react-icons/im";
import { Link } from "react-router-dom";
import { MasterChefStakingWidget } from "components/atomic/organisms/MasterChefWidget";
import { Page, StakingWidget, Token } from "components/atomic";
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
  const masterChefDetail = useSelector(
    selectors.selectMasterChefFormattedStaking
  );
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
      <Row gutter={24}>
        <Col span={12}>
          <Checkbox.Group style={{ width: "100%" }}>
            <Row
              gutter={50}
              align="middle"
              style={{ textAlign: "center", fontSize: 18 }}
            >
              <Col
                span={8}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  alt="NDX"
                  src={require("images/indexed.png").default}
                  style={{ width: 48, height: 48, marginBottom: 12 }}
                />
                <Checkbox value="single">Show Single-Sided</Checkbox>
              </Col>
              <Col
                span={8}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  alt="Uniswap"
                  src={require("images/uni.png").default}
                  style={{ width: 48, height: 48, marginBottom: 12 }}
                />
                <Checkbox value="uniswap">Show Uniswap LP</Checkbox>
              </Col>
              <Col
                span={8}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  alt="Sushiswap"
                  src={require("images/sushi.png").default}
                  style={{ width: 48, height: 48, marginBottom: 12 }}
                />
                <Checkbox value="sushiswap">Show Sushiswap LP</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Col>
        <Col span={8} push={4}>
          <Checkbox.Group style={{ width: "100%" }}>
            <Row
              gutter={50}
              align="middle"
              style={{ textAlign: "center", fontSize: 18 }}
            >
              <Col
                span={12}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography.Text type="success">
                  <ImCheckmark2 style={{ fontSize: 54 }} />
                </Typography.Text>
                <Checkbox value="active">Show Active</Checkbox>
              </Col>
              <Col
                span={12}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography.Text type="danger">
                  <FcExpired style={{ fontSize: 54 }} />
                </Typography.Text>
                <Checkbox value="expired">Show Expired</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Col>
      </Row>

      <Card
        bordered={true}
        style={{ marginTop: 24 }}
        title={
          <Row gutter={24}>
            <Col span={9}>Asset</Col>
            <Col span={5}>Rewards</Col>
            <Col span={5}>Total Staked</Col>
            <Col span={5}>APY</Col>
          </Row>
        }
      >
        {newStakingDetail.indexTokens.map((stakingPool) => (
          <Card
            key={stakingPool.id}
            bordered={true}
            style={{ marginTop: 24 }}
            title={
              <Row gutter={24}>
                <Col span={9}>{stakingPool.name}</Col>
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
                      Staking 12.00 {stakingPool.symbol}
                    </Typography.Text>
                  </em>
                </Col>
                <Col span={5}>13.37%</Col>
              </Row>
            }
          >
            <Row gutter={24} align="middle">
              <Col span={9}>
                <Token
                  name={stakingPool.symbol}
                  address={stakingPool.id}
                  symbol={stakingPool.symbol}
                  symbolOverride={
                    ["UNIV2:", "SUSHI:"].some((prefix) =>
                      stakingPool.symbol.startsWith(prefix)
                    )
                      ? stakingPool.symbol.split(":")[1].replace(/-/g, "/")
                      : stakingPool.symbol
                  }
                  size="medium"
                  style={{ marginRight: 24 }}
                />
              </Col>
              <Col span={5}>{stakingPool.rewardsPerDay}</Col>
              <Col span={5}>
                {stakingPool.totalStaked} {stakingPool.symbol}
              </Col>
              <Col span={5}>
                <Button
                  type={"primary"}
                  size="large"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Link to={`/staking-new/${stakingPool.id}`}>
                    <Space>
                      <FaTractor style={{ position: "relative", top: 2 }} />
                      <span>{tx("STAKE")}</span>
                    </Space>
                  </Link>
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
        {masterChefDetail.map((stakingPool) => (
          <Col key={stakingPool.id} span={24} style={{ marginBottom: 24 }}>
            <MasterChefStakingWidget {...stakingPool} />
          </Col>
        ))}
        {newStakingDetail.liquidityTokens.map((stakingPool) => (
          <Col key={stakingPool.id} span={24} style={{ marginBottom: 24 }}>
            <StakingWidgetNew {...stakingPool} />
          </Col>
        ))}
      </Card>
    </Page>
  );

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
                  {masterChefDetail.map((stakingPool) => (
                    <Col
                      key={stakingPool.id}
                      span={24}
                      style={{ marginBottom: 24 }}
                    >
                      <MasterChefStakingWidget {...stakingPool} />
                    </Col>
                  ))}
                  {newStakingDetail.liquidityTokens.map((stakingPool) => (
                    <Col
                      key={stakingPool.id}
                      span={24}
                      style={{ marginBottom: 24 }}
                    >
                      <StakingWidgetNew {...stakingPool} />
                    </Col>
                  ))}
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
