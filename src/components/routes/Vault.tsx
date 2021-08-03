import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Typography,
} from "antd";
import { Formik } from "formik";
import {
  Page,
  TokenSelector,
  VaultAdapterPieChart,
  VaultCard,
} from "components/atomic";
import { convert } from "helpers";
import { useParams } from "react-router";
import { useVault, useVaultAdapterAPRs, useVaultRegistrar } from "hooks";
import type { NormalizedVault } from "features";

function VaultFormInner() {
  return (
    <Card
      bordered={true}
      title={
        <Row gutter={24} align="middle">
          <Col span={10}>
            <Button block={true} size="large" type="primary">
              Deposit
            </Button>
          </Col>
          <Col span={4}>
            <Divider>or</Divider>
          </Col>
          <Col span={10}>
            <Button block={true} size="large">
              Redeem
            </Button>
          </Col>
        </Row>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <TokenSelector
          assets={[]}
          value={{
            token: "NDX",
            amount: {
              displayed: "0.00",
              exact: convert.toBigNumber("0"),
            },
          }}
          isInput={true}
        />
        <Alert showIcon={true} type="info" message="Performance Fee: 13.37%" />
        <Typography.Title level={4} style={{ textAlign: "right" }}>
          Total: 1,337.00
        </Typography.Title>
        <Button
          type="primary"
          block={true}
          style={{ fontSize: 30, height: 60 }}
        >
          Send Transaction
        </Button>
      </Space>
    </Card>
  );
}

export function LoadedVault({vault}: {vault: NormalizedVault}) {
  const chartData = useVaultAdapterAPRs(vault.id)

  useVaultRegistrar(vault.id);

  return (
    <Page hasPageHeader={true} title="Vault">
      <VaultCard
        key={vault.id}
        withTitle={true}
        bordered={false}
        hoverable={false}
        vault={vault}
      />
      <Divider />
      <Row gutter={24}>
        <Col span={12}>
          <Typography.Title level={2}>Protocol Breakdown</Typography.Title>
          <div
            style={{
              width: 600,
              height: 500,
              textTransform: "uppercase",
              transform: "scale(1.6)",
            }}
          >
            <VaultAdapterPieChart data={chartData.map(r => ({ name: r.name, value: r.apr.toString(), apr: r.apr.toString() }))} />
          </div>
        </Col>
        <Col span={12}>
          <Typography.Title level={2}>
            Interact With {vault.underlying.name}
          </Typography.Title>
          <Formik
            initialValues={{
              asset: "",
              amount: {
                displayed: "0.00",
                exact: convert.toBigNumber("0.00"),
              },
              inputType: "stake",
            }}
            onSubmit={console.info}
            validateOnChange={true}
            validateOnBlur={true}
          >
            <VaultFormInner />
          </Formik>
        </Col>
      </Row>
    </Page>
  );
}

export default function Vault() {
  const { slug } = useParams<{ slug: string }>();
  const vault = useVault(slug);

  return vault ? <LoadedVault vault={vault} /> : null;
}
