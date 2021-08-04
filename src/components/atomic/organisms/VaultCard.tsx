import { Card, Col, Row, Tooltip, Typography } from "antd";
import { NormalizedVault } from "features";
import { convert } from "helpers";
import { useAllVaults, useVaultAPR } from "hooks";
import { useHistory } from "react-router";

type Props = {
  key: string
  hoverable?: boolean
  bordered?: boolean
  withTitle?: boolean
  vault: NormalizedVault
}

export function VaultCard({
  key,
  hoverable,
  bordered,
  withTitle,
  vault: {
    id: vaultId,
    underlying,
    decimals,
    totalValue
  }
}: Props) {
  const tvl = convert.toBalance(totalValue || '0', decimals, true, 4)
  const apr = useVaultAPR(vaultId)
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
            <Typography.Title level={2}>{underlying.symbol} Locked</Typography.Title>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Typography.Title level={2}>APR</Typography.Title>
          </Col>
        </Row>
      )}
      <Row align="middle">
        <Col xs={24} md={6}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {underlying.name}
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {tvl} {underlying.symbol}
          </Typography.Title>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Tooltip title="Annualized based on the current interest rate.">
            <Typography.Title level={3} style={{ margin: 0 }} type="success">
              {apr}%
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
          hoverable={true}
          bordered={true}
          withTitle={withTitle}
          vault={vault}
        />
      ))}
    </>
  );
}
