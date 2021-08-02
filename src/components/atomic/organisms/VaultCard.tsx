import { Card, Col, Row, Tooltip, Typography } from "antd";
import { useAllVaults } from "hooks";
import { useHistory } from "react-router";

export function VaultCard({
  vaultId,
  withTitle,
  name,
  bordered,
  hoverable,
}: any) {
  const { push } = useHistory();

  return (
    <Card
      hoverable={hoverable}
      bordered={bordered}
      style={{ position: "relative", overflow: "hidden" }}
      onClick={() => push(`/vaults/${vaultId}`)}
    >
      {withTitle && (
        <Row>
          <Col xs={24} md={6} style={{ textAlign: "left" }}></Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>TVL</Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>APR</Typography.Title>
          </Col>
        </Row>
      )}
      <Row align="middle">
        <Col xs={24} md={6}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {name}
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {/* {totalValueLocked} */}
            (TVL)
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Tooltip title="Annualized based on the current interest rate.">
            <Typography.Title level={3} style={{ margin: 0 }} type="success">
              (APR)
            </Typography.Title>
          </Tooltip>
        </Col>
      </Row>
    </Card>
  );
}

export function VaultGroup({ withTitle = false }: { withTitle?: boolean }) {
  const vaults = useAllVaults();

  return (
    <>
      {vaults.map((vault) => (
        <VaultCard
          key={vault.name}
          vaultId={vault.id}
          hoverable={true}
          bordered={true}
          withTitle={withTitle}
          {...vault}
          underlying={vault?.underlying ?? ""}
        />
      ))}
    </>
  );
}
