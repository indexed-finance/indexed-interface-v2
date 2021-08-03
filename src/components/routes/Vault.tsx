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
import {
  useApprovalStatus,
  useBalancesRegistrar,
  useTokenApproval,
  useVault,
  useVaultRegistrar,
} from "hooks";
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import type { FormattedVault } from "features";

function VaultFormInner({ vault }: { vault: FormattedVault }) {
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

export function LoadedVault(props: FormattedVault) {
  const chartData = props.adapters.map(({ protocol }) => ({
    name: protocol.name,
    value: "",
    apr: "",
  }));

  useVaultRegistrar(props.id);
  useBalancesRegistrar([props.underlying.id]);

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
            Interact With {props.underlying.name}
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
            <VaultFormInner vault={props} />
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
