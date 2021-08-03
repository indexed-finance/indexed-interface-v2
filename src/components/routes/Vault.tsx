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
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { useVault, useVaultRegistrar } from "hooks";
import type { FormattedVault } from "features";

function VaultFormInner() {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const changeMode = useCallback(
    (newMode: "deposit" | "withdraw") => setMode(newMode),
    []
  );
  const handleSubmit = useCallback(() => {
    if (mode === "deposit") {
    } else {
    }
  }, [mode]);

  return (
    <Card
      bordered={true}
      title={
        <Row gutter={24} align="middle">
          <Col span={10}>
            <Button
              block={true}
              size="large"
              type={mode === "deposit" ? "primary" : "default"}
              onClick={() => changeMode("deposit")}
            >
              Deposit
            </Button>
          </Col>
          <Col span={4}>
            <Divider>or</Divider>
          </Col>
          <Col span={10}>
            <Button
              block={true}
              size="large"
              type={mode === "withdraw" ? "primary" : "default"}
              onClick={() => changeMode("withdraw")}
            >
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
          onClick={handleSubmit}
        >
          {mode === "deposit" ? "Deposit" : "Redeem"}
        </Button>
      </Space>
    </Card>
  );
}

export function LoadedVault(props: FormattedVault) {
  const chartData = props.adapters.map(({ protocol }) => ({
    name: protocol.name,
    value: "",
    apr: "",
  }));

  useVaultRegistrar(props.id);

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
            <VaultAdapterPieChart data={chartData} />
          </div>
        </Col>
        <Col span={12}>
          <Typography.Title level={2}>
            Interact With {props.name}
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

  return vault ? <LoadedVault {...vault} /> : null;
}
