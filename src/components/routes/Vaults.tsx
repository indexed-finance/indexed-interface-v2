import { Card, Col, Divider, Row, Tooltip, Typography } from "antd";
import { Page, Token } from "components/atomic";
import { useBreakpoints } from "hooks";

export default function Vaults() {
  const { isMobile } = useBreakpoints();

  return (
    <Page hasPageHeader={true} title="Vaults">
      {!isMobile && (
        <Row>
          <Col xs={24} md={6} offset={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>TVL</Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>APR</Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>Powered by</Typography.Title>
          </Col>
        </Row>
      )}
      <Card
        hoverable={true}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <Row align="middle">
          <Col xs={24} md={6}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              <Token symbol="UNI" name="Uniswap" size="large" />
            </Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              $50.2M
            </Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Tooltip title="Annualized based on the current interest rate.">
              <Typography.Title level={3} style={{ margin: 0 }} type="success">
                43.0% <br />
                <small>+1337.00 NDX per day</small>
              </Typography.Title>
            </Tooltip>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Divider>
              <Token
                symbol="SUSHI"
                name="Sushiswap"
                showSymbol={false}
                showName={true}
                size="large"
              />
            </Divider>
          </Col>
        </Row>
        <img
          src={require("images/sushi.png").default}
          alt="Backdrop"
          style={{
            position: "absolute",
            bottom: -34,
            right: -34,
            width: 128,
            height: 128,
            opacity: 0.2,
          }}
        />
      </Card>
    </Page>
  );
}

// Row or card for each vault

// TVL (abbreviate, e.g. 50.2m)

// Token icon

// Token symbol

// Current APR

// Tooltip saying it is annualized based on the current interest rate

// Icons showing current protocols interest is being gathered from

// //

// // CURRENCY
// // POOL
// // APY
// // APR
