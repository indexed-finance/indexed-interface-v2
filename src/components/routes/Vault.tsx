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
import { BiDoughnutChart } from "react-icons/bi";
import { BigNumber, convert } from "helpers";
import {
  FormattedVault,
  useBalanceAndApprovalRegistrar,
  useNirnTransactionCallbacks,
  useTokenApproval,
  useVault,
  useVaultAPR,
  useVaultAdapterAPRs,
  useVaultRegistrar,
  useVaultUserBalance,
} from "hooks";
import { Formik } from "formik";
import {
  NirnProtocol,
  Page,
  Token,
  TokenSelector,
  VaultAdapterPieChart,
} from "components/atomic";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createChart } from "lightweight-charts";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

type TokenAmount = { exact: BigNumber; displayed: string };

function VaultFormInner({ vault }: { vault: FormattedVault }) {
  const { underlying, performanceFee } = vault;
  const { deposit, withdrawUnderlying } = useNirnTransactionCallbacks(vault.id);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<TokenAmount>({
    exact: convert.toBigNumber("0.00"),
    displayed: "0.00",
  });
  const dependentAmount = useMemo(() => {
    if (!vault.price) return convert.toBigNumber("0");
    const exact = amount.exact
      .times(convert.toToken("1", 18))
      .div(convert.toBigNumber(vault.price));
    return convert.toBalance(exact, underlying.decimals, true, 2);
  }, [amount, vault, underlying]);
  const { balance, unwrappedBalance } = useVaultUserBalance(vault.id);
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

  useBalanceAndApprovalRegistrar(vault.id, [vault.underlying.id]);

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
          balanceOverride={mode === "deposit" ? balance : unwrappedBalance}
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
type Chart = "weights" | "apr" | "tvl";

function CoreInformationSection({
  children,
  title,
  onChangeChart,
  isActive,
}: {
  children: ReactNode;
  title: string;
  isActive: boolean;
  onChangeChart(): void;
}) {
  return (
    <Card
      style={{ marginBottom: 24 }}
      actions={[
        <Button
          block={true}
          key="1"
          onClick={onChangeChart}
          type={isActive ? "primary" : "default"}
          style={{ border: "none" }}
          icon={
            <BiDoughnutChart
              style={{ position: "relative", top: 2, left: -2 }}
            />
          }
        >
          Chart
        </Button>,
      ]}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Title level={2} type={isActive ? "warning" : "secondary"}>
            {title}
          </Typography.Title>
        </div>
      }
    >
      {children}
    </Card>
  );
}

export function LoadedVault({ vault }: { vault: FormattedVault }) {
  const chartData = useVaultAdapterAPRs(vault.id).map((a, i) => ({
    ...a,
    value: vault.weights[i] * 100,
    weight: vault.weights[i] * 100,
    apr: +(a.apr * 100).toFixed(2),
    baseAPR: +(a.baseAPR * 100).toFixed(2),
  }));
  const apr = useVaultAPR(vault.id);
  const isLoadingApr = apr === 0;
  const [chart, setChart] = useState<Chart>("weights");
  const onChangeChart = useCallback(
    (chart: Chart) => () => setChart(chart),
    []
  );
  const {
    wrappedBalance: { displayed },
  } = useVaultUserBalance(vault.id);

  useVaultRegistrar(vault.id);

  return (
    <Page
      hasPageHeader={true}
      title={
        <Space>
          <Token
            name={vault.underlying.symbol}
            symbol={vault.underlying.symbol}
            size="large"
          />
          <span>Nirn Vault</span>
        </Space>
      }
      extra={
        <Space direction="vertical">
          <Typography.Title
            level={3}
            style={{ margin: 0, marginRight: "1rem" }}
          >
            Your Balance:{" "}
            <Typography.Text type="success">
              {displayed} {vault.symbol}
            </Typography.Text>
          </Typography.Title>
        </Space>
      }
    >
      <Row gutter={24}>
        {/* Core Stats */}
        <Col xs={24} md={6}>
          {/* Protocols */}
          <CoreInformationSection
            title="Protocols"
            isActive={chart === "weights"}
            onChangeChart={onChangeChart("weights")}
          >
            {vault.adapters.map((adapter, i) => (
              <Space
                style={{
                  marginBottom: 12,
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Progress
                  percent={chartData[i].weight}
                  type="circle"
                  size="small"
                  width={48}
                />
                <NirnProtocol
                  key={adapter.id}
                  name={adapter.protocol.name}
                  showName={true}
                />
              </Space>
            ))}
          </CoreInformationSection>
          {/* TVL */}
          <CoreInformationSection
            title="TVL"
            isActive={chart === "tvl"}
            onChangeChart={onChangeChart("tvl")}
          >
            <Typography.Title level={1}>${vault.usdValue}</Typography.Title>
          </CoreInformationSection>
          {/* APR */}
          <CoreInformationSection
            title="APR"
            isActive={chart === "apr"}
            onChangeChart={onChangeChart("apr")}
          >
            <Typography.Title level={1} type="success">
              {isLoadingApr ? <Spin /> : convert.toPercent(apr / 100)}
            </Typography.Title>
          </CoreInformationSection>
        </Col>
        {/* Chart */}
        <Col xs={24} md={12}>
          <div
            style={{
              position: "relative",
              width: 400,
              height: 400,
              marginBottom: 80,
              transform: "scale(2)",
              transformOrigin: 0,
            }}
          >
            <VaultAdapterPieChart data={chartData} />
          </div>
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

          <Divider />

          <Card
            title={<Typography.Title level={2}>Learn more</Typography.Title>}
          >
            ...
          </Card>
        </Col>
      </Row>
    </Page>
  );
}
