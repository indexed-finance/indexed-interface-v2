import {
  Alert,
  Card,
  Checkbox,
  Col,
  Empty,
  Row,
  Space,
  Typography,
} from "antd";
import { Fade } from "components/animations";
import {
  IndexSection,
  LiquiditySection,
  VaultSection,
} from "components/portfolio";
import {
  Page,
  PortfolioWidget,
  Token,
  WalletConnector,
} from "components/atomic";
import { convert } from "helpers";
import { selectors } from "features";
import {
  useBreakpoints,
  useMasterChefRegistrar,
  useNewStakingRegistrar,
  usePortfolioData,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useEffect, useMemo, useState } from "react";
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
  const isUserConnected = useSelector(selectors.selectUserConnected);
  const { ndx, totalValue: totalValueWithoutVaults } = usePortfolioData({
    onlyOwnedAssets: true,
  });
  const [usdValueFromVaults, setUsdValueFromVaults] = useState(0);
  const handleReceivedUsdValueFromVaults = (amount: number) =>
    setUsdValueFromVaults(amount);
  const totalValue = useMemo(() => {
    const parsedTotalValueWithoutVaults = parseFloat(
      totalValueWithoutVaults.replace(/\$/g, "").replace(/,/g, "")
    );

    return parsedTotalValueWithoutVaults + usdValueFromVaults;
  }, [totalValueWithoutVaults, usdValueFromVaults]);

  return (
    <Page hasPageHeader={true} title="Portfolio">
      {isUserConnected ? (
        <>
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
                  USD {convert.toCurrency(totalValue)}
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
                    <Token
                      amount={ndx.balance}
                      symbol="NDX"
                      name="NDX"
                      size="large"
                    />
                    <Typography.Text
                      type="success"
                      style={{ textAlign: "right", margin: 0 }}
                    >
                      USD {ndx.value}
                    </Typography.Text>
                  </Space>
                </Typography.Title>
              </Card>
            </Col>
          </Row>
          <VaultSection onUsdValueChange={handleReceivedUsdValueFromVaults} />
          <IndexSection />
          <LiquiditySection />
        </>
      ) : (
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <Empty description="No wallet detected." />
          <WalletConnector />
        </Space>
      )}
    </Page>
  );
}
