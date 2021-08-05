import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import { AppState, selectors } from "features";
import { BigNumber, convert } from "helpers";
import {
  FormattedVault,
  useBalanceAndApprovalRegistrar,
  useNirnTransactionCallbacks,
  useTokenApproval,
  useTokenBalances,
  useVault,
  useVaultAPR,
  useVaultAdapterAPRs,
} from "hooks";
import { Formik } from "formik";
import {
  NirnProtocol,
  Page,
  TokenSelector,
  VaultAdapterPieChart,
} from "components/atomic";
import { createChart } from "lightweight-charts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

type TokenAmount = { exact: BigNumber; displayed: string };

function VaultFormInner({ vault }: { vault: FormattedVault }) {
  const { underlying, performanceFee } = vault;

  useBalanceAndApprovalRegistrar(vault.id, [vault.underlying.id]);
  const balances = useTokenBalances([underlying.id, vault.id]);
  const { deposit, withdrawUnderlying } = useNirnTransactionCallbacks(vault.id);

  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  const [amount, setAmount] = useState<TokenAmount>({
    exact: convert.toBigNumber("0.00"),
    displayed: "0.00",
  });

  const toUnderlyingAmount = useCallback(
    (exactTokenAmount: BigNumber) => {
      if (!vault.price) return convert.toBigNumber("0");
      return exactTokenAmount
        .times(convert.toBigNumber(vault.price))
        .div(convert.toToken("1", 18));
    },
    [vault]
  );

  const dependentAmount = useMemo(() => {
    if (!vault.price) return convert.toBigNumber("0");
    const exact = amount.exact
      .times(convert.toToken("1", 18))
      .div(convert.toBigNumber(vault.price));
    return convert.toBalance(exact, underlying.decimals, true, 2);
  }, [amount, vault, underlying]);

  const balance = useMemo(() => {
    if (mode === "deposit") {
      const exact = convert.toBigNumber(balances[0]);
      const displayed = convert.toBalance(
        exact,
        underlying.decimals,
        false,
        10
      );
      return { exact, displayed };
    }
    const exact = toUnderlyingAmount(convert.toBigNumber(balances[1]));
    const displayed = convert.toBalance(exact, underlying.decimals, false, 10);
    return { exact, displayed };
  }, [balances, mode, toUnderlyingAmount, underlying]);

  const handleSubmit = useCallback(() => {
    if (mode === "deposit") {
      deposit(amount.exact.integerValue().toString(10));
    } else {
      withdrawUnderlying(amount.exact.integerValue().toString(10));
    }
  }, [mode, amount, deposit, withdrawUnderlying]);
  const { status, approve } = useTokenApproval({
    tokenId: vault.underlying.id,
    spender: vault.id,
    amount: amount.displayed,
    rawAmount: amount.exact.toString(),
    symbol: vault.symbol,
  });

  return (
    <Card
      bordered={true}
      title={
        <Row gutter={24} align="middle">
          <Col span={24}>
            <Typography.Title level={2}>I want to</Typography.Title>
          </Col>
          <Col span={10}>
            <Button
              block={true}
              size="large"
              type={mode === "deposit" ? "primary" : "default"}
              onClick={() => setMode("deposit")}
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
              onClick={() => setMode("withdraw")}
            >
              Withdraw
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
        <Alert
          showIcon={true}
          type="info"
          style={{ borderRadius: 0 }}
          message={
            <Tooltip
              title={`The Indexed DAO treasury receives a small percentage of the vault's profits.`}
            >
              {`Performance Fee: ${convert.toPercent(performanceFee)}`}
            </Tooltip>
          }
        />
        <Alert
          showIcon={true}
          type="success"
          message={
            <Tooltip
              title={`You’ll receive X nWBTC in exchange for your WBTC: don’t misplace this, you’ll need it to get your assets back`}
            >
              You will receive {dependentAmount} {vault.symbol}
            </Tooltip>
          }
        />
        {status === "approval needed" && mode === "deposit" ? (
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
            disabled={status === "unknown" || amount.exact.eq(0)}
            block={true}
            style={{ fontSize: 30, height: 60 }}
            onClick={handleSubmit}
          >
            {mode === "deposit" ? "Deposit" : "Withdraw"}
          </Button>
        )}
      </Space>
    </Card>
  );
}

export default function Vault() {
  const { slug } = useParams<{ slug: string }>();
  const vaultBySymbol = useSelector((state: AppState) =>
    selectors.selectVaultBySymbol(state, slug)
  );
  const vault = useVault(vaultBySymbol?.id ?? "");

  return vault ? <LoadedVault vault={vault} /> : null;
}

export function VaultHistoricalChart() {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (container.current) {
      createChart(container.current);
    }
  }, []);

  return <div ref={container}>Chart</div>;
}

// ===

export function LoadedVault({ vault }: { vault: FormattedVault }) {
  const chartData = useVaultAdapterAPRs(vault.id).map((a, i) => ({
    ...a,
    value: vault.weights[i] * 100,
    weight: vault.weights[i] * 100,
    apr: +(a.apr * 100).toFixed(2),
  }));
  const apr = useVaultAPR(vault.id);
  const isLoadingApr = apr === 0;

  return (
    <Page hasPageHeader={true} title="Vault">
      <Row gutter={24}>
        {/* Core Stats */}
        <Col xs={24} md={6}>
          <div style={{ padding: "36px 24px" }}>
            <Typography.Title level={1}>Protocols</Typography.Title>
            {vault.adapters.map((adapter) => (
              <Space>
                <div
                  style={{
                    transform: "scale(0.3)",
                    transformOrigin: 0,
                    fontSize: 32,
                  }}
                >
                  <Progress percent={50} type="circle" />
                </div>
                <NirnProtocol
                  key={adapter.id}
                  name={adapter.protocol.name}
                  showName={true}
                />
              </Space>
            ))}
          </div>
          <div style={{ padding: "36px 24px" }}>
            <Typography.Title level={2}>TVL</Typography.Title>
            <Typography.Title level={1}>${vault.usdValue}</Typography.Title>
          </div>
          <div style={{ padding: "36px 24px" }}>
            <Typography.Title level={2}>APR</Typography.Title>
            <Typography.Title level={1} type="success">
              {isLoadingApr ? <Spin /> : convert.toPercent(apr / 100)}
            </Typography.Title>
          </div>
        </Col>
        {/* Chart */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Typography.Title level={2}>Protocol Breakdown</Typography.Title>
            }
          >
            <div
              className="Mememe"
              style={{
                position: "relative",
                width: 400,
                height: 400,
                transform: "scale(1.6)",
                transformOrigin: 0,
              }}
            >
              <VaultAdapterPieChart data={chartData} />
            </div>
          </Card>
        </Col>
        {/* Form */}
        <Col xs={24} md={6}>
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
