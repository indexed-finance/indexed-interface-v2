import { Col, Row, Typography } from "antd";
import { Page, VaultCard } from "components/atomic";
import { useBreakpoints } from "hooks";
import { useHistory } from "react-router";

export default function Vaults() {
  const { isMobile } = useBreakpoints();
  const { push } = useHistory();

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
        </Row>
      )}
      <VaultCard />
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
