import { Card, Col, Divider, Progress, Row, Typography } from "antd";
import { Label, Page, VaultCard } from "components/atomic";
import { useParams } from "react-router";
import { useVault } from "hooks";
import type { FormattedVault } from "features";

export function LoadedVault(props: FormattedVault) {
  return (
    <Page hasPageHeader={true} title="Vault">
      <VaultCard
        vaultId={props.id}
        withTitle={true}
        bordered={false}
        hoverable={false}
        {...props}
      />
      <Divider />
      <Row gutter={24}>
        {props.adapters.map((adapter) => (
          <Col key={adapter.protocol} xs={24} md={8}>
            <Card className="large-progress">
              <Card.Meta
                avatar={
                  <Progress
                    style={{
                      marginTop: 12,
                      fontSize: 48,
                      textAlign: "center",
                    }}
                    width={120}
                    status="active"
                    type="dashboard"
                    percent={parseFloat(adapter.percentage.replace(/%/g, ""))}
                  />
                }
                title={
                  <Typography.Title level={2}>
                    {adapter.protocol.toUpperCase()}
                  </Typography.Title>
                }
                description={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <Label>APR</Label>
                    <Typography.Title level={3} type="success">
                      {adapter.annualPercentageRate}
                    </Typography.Title>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Page>
  );
}

export default function Vault() {
  const { slug } = useParams<{ slug: string }>();
  const vault = useVault(slug);

  return vault ? <LoadedVault {...vault} /> : null;
}
