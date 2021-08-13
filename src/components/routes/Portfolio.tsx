import { Card, Col, Empty, Row, Space, Typography } from "antd";
import {
  IndexSection,
  LiquiditySection,
  VaultSection,
} from "components/portfolio";
import {
  Page,
  PortfolioPieChart,
  Token,
  WalletConnector,
} from "components/atomic";
import { convert } from "helpers";
import { selectors } from "features";
import { useBreakpoints, usePortfolioData } from "hooks";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function Portfolio() {
  const { isMobile } = useBreakpoints();
  const isUserConnected = useSelector(selectors.selectUserConnected);
  const { ndx, tokens, totalValue: totalValueWithoutVaults } = usePortfolioData(
    {
      onlyOwnedAssets: true,
    }
  );
  const [usdValueFromVaults, setUsdValueFromVaults] = useState(0);
  const handleReceivedUsdValueFromVaults = (amount: number) =>
    setUsdValueFromVaults(amount);
  const totalValue = useMemo(() => {
    const parsedTotalValueWithoutVaults = parseFloat(
      totalValueWithoutVaults.replace(/\$/g, "").replace(/,/g, "")
    );

    return parsedTotalValueWithoutVaults + usdValueFromVaults;
  }, [totalValueWithoutVaults, usdValueFromVaults]);

  const chartData = useMemo(() => {
    // NDX
    const ndxUsdValue = parseFloat(
      ndx.value.replace(/\$/g, "").replace(/,/g, "")
    );
    const ndxPercentage = ndxUsdValue / totalValue;

    // Index
    const indexTokens = tokens.filter(
      (token) => !token.isSushiswapPair && !token.isUniswapPair
    );
    const indexUsdValue = indexTokens
      .map((token) => token.value.replace(/\$/g, ""))
      .map((value) => parseFloat(value))
      .reduce((prev, next) => prev + next, 0);
    const indexPercentage = indexUsdValue / totalValue;

    // Liquidity
    const liquidityTokens = tokens.filter(
      (token) => token.isSushiswapPair || token.isUniswapPair
    );
    const liquidityUsdValue = liquidityTokens
      .map((token) => token.value.replace(/\$/g, ""))
      .map((value) => parseFloat(value))
      .reduce((prev, next) => prev + next, 0);
    const liquidityPercentage = liquidityUsdValue / totalValue;

    // Vaults
    const subtotal = indexPercentage + liquidityPercentage + ndxPercentage;
    const vaultsPercentage = 1 - subtotal;

    return [
      {
        name: "NDX",
        value: ndxPercentage,
      },
      {
        name: "Vaults",
        value: vaultsPercentage,
      },
      {
        name: "Indexes",
        value: indexPercentage,
      },
      {
        name: "Liquidity",
        value: liquidityPercentage,
      },
    ];
  }, [ndx, tokens, totalValue]);

  return (
    <Page hasPageHeader={true} title="Portfolio">
      {isUserConnected ? (
        <>
          <Row gutter={24} align="bottom" style={{ marginBottom: 96 }}>
            <Col xs={24} md={12} lg={8}>
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
                  {convert.toCurrency(totalValue)}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
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
                      {ndx.value}
                    </Typography.Text>
                  </Space>
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <div
                style={{
                  position: "relative",
                  width: 200,
                  height: 200,
                  transform: `scale(${isMobile ? "1.2" : "1.6"}) ${
                    isMobile ? "translateX(80px) translateY(40px)" : ""
                  }`,
                }}
              >
                <PortfolioPieChart data={chartData} />
              </div>
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
