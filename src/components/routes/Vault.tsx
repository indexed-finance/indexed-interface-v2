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
import { BigNumber, convert } from "helpers";
import { Formik } from "formik";
import {
  Page,
  TokenSelector,
  VaultAdapterPieChart,
  VaultCard,
} from "components/atomic";
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import {
  useTokenApproval,
  useVault,
  useVaultAdapterAPRs,
  useVaultRegistrar,
} from "hooks";
import type { NormalizedVault } from "features";

function VaultFormInner({ vault }: { vault: NormalizedVault }) {
  const { underlying, performanceFee } = vault;
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const changeMode = useCallback(
    (newMode: "deposit" | "withdraw") => setMode(newMode),
    []
  );
  const [amount, setAmount] = useState<{
    exact: BigNumber;
    displayed: string;
  }>({
    exact: convert.toBigNumber("0.00"),
    displayed: "0.00",
  });
  const handleSubmit = useCallback(() => {
    if (mode === "deposit") {
      console.log("am", amount);
    } else {
    }
  }, [mode, amount]);
  const { status, approve } = useTokenApproval({
    tokenId: vault.underlying.id,
    spender: vault.id,
    amount: amount.displayed,
    rawAmount: amount.exact.toString(),
    symbol: vault.symbol,
  });

  console.log({ status });

  // const toUnderlyingAmount = (exactTokenAmount: BigNumber) => {
  //   if (!vault.price) return convert.toBigNumber("0");
  //   return exactTokenAmount
  //     .mul(convert.toBigNumber(vault.price))
  //     .div(convert.toToken(1, 18));
  // };

  // const toWrappedAmount = (exactUnderlyingAmount: BigNumber) => {
  //   if (!vault.price) return convert.toBigNumber("0");
  //   return exactUnderlyingAmount
  //     .mul(convert.toToken(1, 18))
  //     .div(convert.toBigNumber(vault.price));
  // };

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
            token: underlying.symbol,
            amount,
          }}
          onChange={(next) => {
            if (next?.amount) {
              setAmount(next.amount);
            }
          }}
          isInput={true}
        />
        <Alert
          showIcon={true}
          type="info"
          message={`Performance Fee: ${convert.toPercent(performanceFee)}`}
        />
        {status === "approval needed" ? (
          <Button
            type="primary"
            block={true}
            style={{ fontSize: 30, height: 60 }}
            onClick={approve}
          >
            Approve
          </Button>
        ) : (
          <Button
            type="primary"
            disabled={status === "unknown"}
            block={true}
            style={{ fontSize: 30, height: 60 }}
            onClick={handleSubmit}
          >
            {mode === "deposit" ? "Deposit" : "Redeem"}
          </Button>
        )}
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
            <VaultFormInner vault={vault} />
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
