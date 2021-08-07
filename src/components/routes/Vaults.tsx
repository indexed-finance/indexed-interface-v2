import { Col, Row, Typography } from "antd";
import { Page, VaultGroup } from "components/atomic";
import { useAllVaultsRegistrar, useBreakpoints } from "hooks";

export default function Vaults() {
  const { isMobile } = useBreakpoints();

  useAllVaultsRegistrar();

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
            <Typography.Title level={2}>Protocols</Typography.Title>
          </Col>
        </Row>
      )}
      <VaultGroup />
    </Page>
  );
}
