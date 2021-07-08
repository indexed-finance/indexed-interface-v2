import { Col, Row, Typography } from "antd";
import { Page, VaultCard } from "components/atomic";
import { useAllVaults, useBreakpoints } from "hooks";

export default function Vaults() {
  const { isMobile } = useBreakpoints();
  const vaults = useAllVaults();

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
      {vaults.map((vault) => (
        <VaultCard
          key={vault.name}
          vaultId={vault.id}
          hoverable={true}
          bordered={true}
          withTitle={false}
          {...vault}
        />
      ))}
    </Page>
  );
}
