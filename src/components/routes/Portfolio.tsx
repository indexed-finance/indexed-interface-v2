import {
  Alert,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  List,
  Row,
  Space,
  Typography,
} from "antd";
import { Fade } from "components/animations";
import {
  Label,
  Page,
  PortfolioWidget,
  Token,
  WalletConnector,
} from "components/atomic";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { selectors } from "features";
import {
  useBreakpoints,
  useMasterChefRegistrar,
  useNewStakingRegistrar,
  usePortfolioData,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";

export function PPortfolio() {
  const tx = useTranslator();
  const [showOwnedAssets, setShowOwnedAssets] = useState(true);
  const { ndx, tokens, totalValue } = usePortfolioData({
    onlyOwnedAssets: showOwnedAssets,
  });
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);
  const { isMobile } = useBreakpoints();
  const isUserConnected = useSelector(selectors.selectUserConnected);
  const [fadedWidget, setFadedWidget] = useState(-1);

  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  useEffect(() => {
    if (fadedWidget < data.length - 1) {
      setTimeout(() => {
        setFadedWidget((prev) => prev + 1);
      }, 200);
    }
  }, [fadedWidget, data.length]);

  return (
    <Page
      hasPageHeader={true}
      title={tx("PORTFOLIO")}
      extra={
        isUserConnected ? (
          <Space direction="vertical">
            <Typography.Title
              level={3}
              style={{
                margin: 0,
                marginRight: "1rem",
                textTransform: "uppercase",
              }}
            >
              Total value:{" "}
              {!isMobile && (
                <Typography.Text type="success" style={{ margin: 0 }}>
                  {totalValue}
                </Typography.Text>
              )}
            </Typography.Title>
            {isMobile && (
              <Typography.Title type="success" style={{ margin: 0 }}>
                {totalValue}
              </Typography.Title>
            )}
            <Checkbox
              checked={showOwnedAssets}
              onChange={(value) => setShowOwnedAssets(value.target.checked)}
            >
              Only show owned or staked assets
            </Checkbox>
          </Space>
        ) : (
          <Alert
            style={{ maxWidth: 500 }}
            showIcon={true}
            type="warning"
            message="Connect your wallet to view."
          />
        )
      }
    >
      {isUserConnected ? (
        <Row gutter={[20, 20]}>
          {data
            .filter((heldAsset) => !heldAsset.symbol.includes("ERROR"))
            .map((heldAsset, index) => (
              <Col xs={24} sm={8}>
                <Fade key={heldAsset.address} in={fadedWidget >= index}>
                  <PortfolioWidget {...heldAsset} />
                </Fade>
              </Col>
            ))}
        </Row>
      ) : (
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <Empty description="No wallet detected." />
          <WalletConnector />
        </Space>
      )}
    </Page>
  );
}

export default function Portfolio() {
  const { ndx, totalValue } = usePortfolioData({
    onlyOwnedAssets: true,
  });

  return (
    <Page hasPageHeader={true} title="Portfolio">
      {/* Top */}
      <Row gutter={24} align="bottom" style={{ marginBottom: 96 }}>
        <Col span={8}>
          <Card
            bordered={false}
            title={
              <Typography.Title
                type="warning"
                level={3}
                style={{
                  margin: 0,
                  marginRight: 24,
                  textTransform: "uppercase",
                }}
              >
                Total value
              </Typography.Title>
            }
          >
            <Typography.Title
              level={1}
              type="success"
              style={{ margin: 0, textTransform: "uppercase" }}
            >
              USD $42,069.00
            </Typography.Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            bordered={false}
            title={
              <Typography.Title
                type="warning"
                level={3}
                style={{
                  margin: 0,
                  marginRight: 24,
                  textTransform: "uppercase",
                }}
              >
                Governance Token
              </Typography.Title>
            }
          >
            <Typography.Title
              level={1}
              style={{ margin: 0, textTransform: "uppercase" }}
            >
              <Space direction="vertical" size="large">
                <Token amount="X.XX" symbol="NDX" name="NDX" size="large" />
                <Typography.Text type="success" style={{ textAlign: "right" }}>
                  USD $62,000.00
                </Typography.Text>
              </Space>
            </Typography.Title>
          </Card>
        </Col>
      </Row>

      <VaultsSection />
      <IndexesSection />
      <LiquiditySection />
    </Page>
  );
}

// Vault
function VaultCard() {
  return (
    <PortfolioCard
      amount="X.XX"
      symbol="DAI"
      name="DAI"
      usdValue="USD $200.00"
      extra={<Typography.Title level={3}>4.20% APR</Typography.Title>}
      actions={[
        <List key="list">
          <List.Item>
            <Label>Earned</Label>
            USD $4.20
          </List.Item>
        </List>,
      ]}
    />
  );
}

function VaultsSection() {
  return (
    <PortfolioSection title="Vaults" usdValue="USD $10,000.00">
      <Row gutter={12} align="bottom">
        <Col span={8}>
          <VaultCard />
        </Col>
        <Col span={8}>
          <VaultCard />
        </Col>
        <Col span={8}>
          <VaultCard />
        </Col>
      </Row>
    </PortfolioSection>
  );
}

// Index

function IndexCard() {
  return (
    <PortfolioCard
      amount="X.XX"
      symbol="DEFI5"
      name="DEFI5"
      usdValue="USD $200.00"
      actions={[
        <List key="list">
          <List.Item>
            <Label>Currently staking</Label>
            X.XX DEFI5
          </List.Item>
          <List.Item>
            <Label>Earned</Label>
            X.XX NDX
          </List.Item>
          <List.Item>
            <Label>Ready to claim</Label>
            X.XX NDX{" "}
          </List.Item>
        </List>,
      ]}
    />
  );
}

function IndexesSection() {
  return (
    <PortfolioSection title="Indexes" usdValue="USD $10,000.00">
      <Row gutter={12} align="bottom">
        <Col span={8}>
          <IndexCard />
        </Col>
        <Col span={8}>
          <IndexCard />
        </Col>
        <Col span={8}>
          <IndexCard />
        </Col>
      </Row>
    </PortfolioSection>
  );
}

// Liquidity
function LiquidityCard() {
  return (
    <PortfolioCard
      amount="X.XX"
      symbol="WETH:DEGEN"
      name="WETH:DEGEN"
      usdValue="USD $200.00"
      actions={[
        <List key="list">
          <List.Item>
            <Label>Currently staking</Label>
            X.XX WETH:DEGEN
          </List.Item>
          <List.Item>
            <Label>Earned</Label>
            X.XX NDX
          </List.Item>
          <List.Item>
            <Label>Ready to claim</Label>
            X.XX NDX
          </List.Item>
        </List>,
      ]}
    />
  );
}

function LiquiditySection() {
  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  return (
    <PortfolioSection title="Liquidity" usdValue="USD $10,000.00">
      <Row gutter={12} align="bottom">
        <Col span={8}>
          <LiquidityCard />
        </Col>
        <Col span={8}>
          <LiquidityCard />
        </Col>
        <Col span={8}>
          <LiquidityCard />
        </Col>
      </Row>
    </PortfolioSection>
  );
}

// Top-Level
function PortfolioCard({
  amount,
  symbol,
  name,
  usdValue,
  actions,
  extra,
}: {
  amount: string;
  symbol: string;
  name: string;
  usdValue: string;
  actions: ReactNode[];
  extra?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <Card
      extra={extra}
      hoverable={true}
      onClick={toggleExpanded}
      title={
        <Space direction="vertical" style={{ width: "100%" }}>
          <Token amount={amount} symbol={symbol} name={name} size="large" />
          <Typography.Title level={4} type="success" style={{ margin: 0 }}>
            {usdValue}
          </Typography.Title>
        </Space>
      }
      bodyStyle={{
        display: expanded ? undefined : "none",
      }}
    >
      {expanded && actions}
    </Card>
  );
}

function PortfolioSection({
  title,
  usdValue,
  children,
}: {
  title: ReactNode;
  usdValue: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <Typography.Title
        level={1}
        type="warning"
        style={{ margin: 0, textTransform: "uppercase" }}
      >
        {title}
      </Typography.Title>
      <Divider orientation="right">
        <Typography.Title
          level={3}
          type="success"
          style={{ textAlign: "right", margin: 0 }}
        >
          {usdValue}
        </Typography.Title>
      </Divider>

      {children}
    </div>
  );
}
