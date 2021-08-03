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
  useBalanceAndApprovalRegistrar,
  useTokenApproval,
  useTokenBalances,
  useVault,
  useVaultAdapterAPRs,
  useVaultRegistrar,
} from "hooks";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import type { NormalizedVault } from "features";

type TokenAmount = {exact: BigNumber; displayed: string;}

function VaultFormInner({ vault }: { vault: NormalizedVault }) {
  const { underlying, performanceFee } = vault;
  const balances = useTokenBalances([underlying.id, vault.id])
  console.log(`Balacnes: ${balances}`)
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const changeMode = useCallback(
    (newMode: "deposit" | "withdraw") => setMode(newMode),
    []
  );
  const [amount, setAmount] = useState<TokenAmount>({
    exact: convert.toBigNumber("0.00"),
    displayed: "0.00",
  });

  const toUnderlyingAmount = useCallback((exactTokenAmount: BigNumber) => {
    if (!vault.price) return convert.toBigNumber("0");
    return exactTokenAmount
      .times(convert.toBigNumber(vault.price))
      .div(convert.toToken('1', 18));
  }, [vault]);

  const dependentAmount = useMemo(() => {
    if (!vault.price) return convert.toBigNumber("0");
    return amount.exact
      .times(convert.toToken('1', 18))
      .div(convert.toBigNumber(vault.price));
  }, [amount, vault])

  const balance = useMemo(() => {
    if (mode === 'deposit') {
      const exact = convert.toBigNumber(balances[0])
      const displayed = convert.toBalance(exact, underlying.decimals, true, 10)
      return { exact, displayed }
    }
    const exact = toUnderlyingAmount(convert.toBigNumber(balances[1]))
    const displayed = convert.toBalance(exact, underlying.decimals, false, 10)
    console.log(`Withdrawal mode - balance ${exact.toString()} | ${displayed}`)
    return { exact, displayed }
  }, [balances, mode, toUnderlyingAmount, underlying])

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

  useBalanceAndApprovalRegistrar(vault.id, [vault.underlying.id]);

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
          balanceOverride={balance}
          selectable={false}
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
        <Typography.Title level={4} style={{ textAlign: "right" }}>
          Total: 1,337.00
        </Typography.Title>
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

export function LoadedVault({ vault }: { vault: NormalizedVault }) {
  const chartData = useVaultAdapterAPRs(vault.id);

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
            <VaultAdapterPieChart
              data={chartData.map((r) => ({
                name: r.name,
                value: r.apr.toString(),
                apr: r.apr.toString(),
              }))}
            />
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
