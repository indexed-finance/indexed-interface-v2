import { Card, Col, Row, Spin, Tooltip, Typography } from "antd";
import { FormattedVault, useAllVaults, useVault, useVaultAPR } from "hooks";
import { NirnProtocol } from "../atoms/NirnProtocol";
import { Token } from "../atoms";
import { useHistory } from "react-router";

type Props = {
  hoverable?: boolean;
  bordered?: boolean;
  withTitle?: boolean;
  vault: FormattedVault;
};

export function VaultCard({
  hoverable,
  bordered,
  withTitle,
  vault: { id: vaultId, underlying, usdValue, adapters },
}: Props) {
  const apr = useVaultAPR(vaultId);
  const { push } = useHistory();
  const isLoadingApr = apr === 0;
  const isLoadingTvl = !usdValue || parseFloat(usdValue) === 0;

  useVault(vaultId);

  return (
    <Card
      hoverable={hoverable}
      bordered={bordered}
      style={{
        position: "relative",
        overflow: "hidden",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        marginBottom: 24,
      }}
      onClick={() => push(`/vaults/${underlying.symbol.toLowerCase()}`)}
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
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>Protocols</Typography.Title>
          </Col>
        </Row>
      )}
      <Row align="middle">
        <Col xs={24} md={6}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            <Token
              name={underlying.name}
              address={underlying.id}
              symbol={underlying.symbol}
              size="small"
            />
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {isLoadingTvl ? <Spin /> : `$${usdValue}`}
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          {isLoadingApr ? (
            <Spin />
          ) : (
            <Tooltip title="Annualized based on the current interest rate.">
              <Typography.Title level={3} style={{ margin: 0 }} type="success">
                {apr}%
              </Typography.Title>
            </Tooltip>
          )}
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Tooltip title="Protocols in use by the vault.">
            <Typography.Title level={3} style={{ margin: 0 }} type="success">
              {adapters.map((a) => (
                <NirnProtocol
                  key={a.id}
                  name={a.protocol.name}
                  showName={true}
                />
              ))}
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
      {withTitle && (
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
      {vaults.map((vault) => (
        <VaultCard
          key={vault.symbol}
          hoverable={true}
          bordered={true}
          vault={vault}
        />
      ))}
    </>
  );
}
