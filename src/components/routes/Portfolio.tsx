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
import { useAllPortfolioData } from "hooks";
import { useSelector } from "react-redux";

export default function Portfolio() {
  const data = useAllPortfolioData();
  const isUserConnected = useSelector(selectors.selectUserConnected);

  return (
    <Page hasPageHeader={true} title="Portfolio">
      {isUserConnected ? (
        <>
          <Row gutter={24} align="top" style={{ marginBottom: 48 }}>
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
                <Card title="In Wallet" type="inner" bordered={false}>
                  <Typography.Title
                    level={1}
                    type="success"
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    {convert.toCurrency(data.totalValue.inWallet)}
                  </Typography.Title>
                </Card>
                <Card title="Accrued" type="inner" bordered={false}>
                  <Typography.Title
                    level={1}
                    type="danger"
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    {convert.toCurrency(data.totalValue.accrued)}
                  </Typography.Title>
                </Card>
                <Card title="Staked" type="inner" bordered={false}>
                  <Typography.Title
                    level={1}
                    type="secondary"
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    {convert.toCurrency(data.totalValue.staking)}
                  </Typography.Title>
                </Card>
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
                <Card title="In Wallet" type="inner" bordered={false}>
                  <Typography.Title
                    level={1}
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    <Space direction="vertical" size="large">
                      <Token
                        amount={data.governanceToken.inWallet.amount.toFixed(2)}
                        symbol="NDX"
                        name="NDX"
                        size="large"
                      />
                      <Typography.Text
                        type="success"
                        style={{ textAlign: "right", margin: 0 }}
                      >
                        {convert.toCurrency(
                          data.governanceToken.inWallet.value
                        )}
                      </Typography.Text>
                    </Space>
                  </Typography.Title>
                </Card>
                {/* // Wait for dNDX */}
                {/* <Card title="Staked" type="inner" bordered={false}>
                  <Typography.Title
                    level={1}
                    type="danger"
                    style={{ margin: 0, textTransform: "uppercase" }}
                  >
                    <Typography.Title
                      level={1}
                      style={{ margin: 0, textTransform: "uppercase" }}
                    >
                      <Space direction="vertical" size="large">
                        <Token
                          amount={data.governanceToken.staking.amount.toFixed(
                            2
                          )}
                          symbol="NDX"
                          name="NDX"
                          size="large"
                        />
                        <Typography.Text
                          type="secondary"
                          style={{ textAlign: "right", margin: 0 }}
                        >
                          {convert.toCurrency(
                            data.governanceToken.staking.value
                          )}
                        </Typography.Text>
                      </Space>
                    </Typography.Title>
                  </Typography.Title>
                </Card> */}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
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
                    Breakdown
                  </Typography.Title>
                }
                bordered={false}
              >
                <PortfolioPieChart data={data.chart} />
              </Card>
            </Col>
            {/* <Col xs={24} lg={8}>
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
                <PortfolioPieChart data={data.chart} />
              </div>
            </Col> */}
          </Row>
          <VaultSection />
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
