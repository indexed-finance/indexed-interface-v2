import { Col, Row, Typography } from "antd";
import { Page, VaultCard } from "components/atomic";
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
        </Row>
      )}
      <VaultCard />
    </Page>
  );
}
