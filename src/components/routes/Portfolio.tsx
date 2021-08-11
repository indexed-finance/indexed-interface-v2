import {
  Alert,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Row,
  Space,
  Typography,
} from "antd";
import { Fade } from "components/animations";
import {
  Page,
  PortfolioWidget,
  Token,
  WalletConnector,
} from "components/atomic";
import { ReactNode, useEffect, useMemo, useState } from "react";
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
      <Row gutter={24} align="bottom">
        <Col span={8}>
          <Card
            title={
              <Typography.Title
                level={2}
                style={{ margin: 0, textTransform: "uppercase" }}
              >
                Total value
              </Typography.Title>
            }
            actions={[
              <Typography.Title
                key="1"
                level={1}
                type="success"
                style={{ margin: 0, textAlign: "right", paddingRight: 12 }}
              >
                USD {totalValue}
              </Typography.Title>,
            ]}
          ></Card>
        </Col>

        <Col span={8}>
          <Card
            actions={[
              <Typography.Title
                key="1"
                level={3}
                type="success"
                style={{ margin: 0, textAlign: "right", paddingRight: 12 }}
              >
                USD {ndx.value}
              </Typography.Title>,
            ]}
            title={
              <Typography.Title
                level={2}
                style={{ margin: 0, textTransform: "uppercase" }}
              >
                Governance token
              </Typography.Title>
            }
          >
            <Token amount={ndx.balance} symbol="NDX" size="large" name="NDX" />
          </Card>
        </Col>

        <Col span={8}>(chart)</Col>
      </Row>

      <Divider />

      {/* By-Kind */}
      <Row gutter={24}>
        <Col
          span={8}
          style={{ borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
        >
          <VaultsSection />
        </Col>
        <Col
          span={8}
          style={{ borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
        >
          <IndexesSection />
        </Col>
        <Col span={8}>
          <LiquiditySection />
        </Col>
      </Row>
    </Page>
  );
}

// Vault
function VaultCard() {
  return (
    <Card
      title={<Token symbol="DAI" name="DAI" size="large" amount="X.XXX" />}
      actions={[
        <ul key="list" style={{ textAlign: "left" }}>
          <li>USD $69,420.00</li>
          <li>4.20% APR</li>
          <li>Earned USD $4.20</li>
        </ul>,
      ]}
    />
  );
}

function VaultsSection() {
  return (
    <PortfolioSection title="Vaults" usdValue="USD $10,000.00">
      <VaultCard />
      <VaultCard />
      <VaultCard />
    </PortfolioSection>
  );
}

// Index
// balance, staking info if any (amt staked, amt of ndx earned & ready to claim)

function IndexCard() {
  return (
    <Card
      title={<Token amount="X.XX" symbol="DEFI5" name="DEFI5" size="large" />}
      actions={[
        <ul key="list" style={{ textAlign: "left" }}>
          <li>USD $42,069.00</li>
          <li>Currently staking X.XX DEFI5</li>
          <li>Earned X.XX NDX</li>
          <li>Ready to claim: X.XX NDX</li>
        </ul>,
      ]}
    />
  );
}

function IndexesSection() {
  return (
    <PortfolioSection title="Indexes" usdValue="USD $10,000.00">
      <IndexCard />
      <IndexCard />
      <IndexCard />
    </PortfolioSection>
  );
}

// Liquidity
function LiquidityCard() {
  return (
    <Card
      title={
        <Token
          amount="X.XX"
          symbol="WETH:DEGEN"
          name="WETH:DEGEN"
          size="large"
        />
      }
      actions={[
        <ul key="list" style={{ textAlign: "left" }}>
          <li>USD $42,069.00</li>
          <li>Currently staking X.XX WETH:DEGEN</li>
          <li>Earned X.XX NDX</li>
          <li>Ready to claim: X.XX NDX</li>
        </ul>,
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
      <LiquidityCard />
      <LiquidityCard />
      <LiquidityCard />
    </PortfolioSection>
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
    <div>
      <Typography.Title
        level={2}
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
      <Space size="large" direction="vertical" style={{ width: "100%" }}>
        {children}
      </Space>
    </div>
  );
}
