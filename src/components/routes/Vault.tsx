import { AppState, selectors } from "features";
import {
  Card,
  Col,
  Progress,
  Row,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import {
  FormattedVault,
  useBreakpoints,
  useVault,
  useVaultAPR,
  useVaultAdapterAPRs,
  useVaultRegistrar,
  useVaultUserBalance,
} from "hooks";
import {
  NirnProtocol,
  Page,
  Token,
  VaultAdapterPieChart,
  VaultForm,
} from "components/atomic";
import { ReactNode, useEffect, useRef } from "react";
import { convert } from "helpers";
import { createChart } from "lightweight-charts";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

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
function CoreInformationSection({
  children,
  title,
  tooltip,
}: {
  children: ReactNode;
  title: string;
  tooltip?: ReactNode;
}) {
  const inner = (
    <Card
      style={{ marginBottom: 24 }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Title level={2} type="warning">
            {title}
          </Typography.Title>
        </div>
      }
    >
      {children}
    </Card>
  );

  return tooltip ? <Tooltip title={tooltip}>{inner}</Tooltip> : inner;
}

function toFixed(num: number, fixed: number) {
  const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  const res = num.toString().match(re);
  return res ? res[0] : "";
}

function LoadedVault({ vault }: { vault: FormattedVault }) {
  const chartData = useVaultAdapterAPRs(vault.id).map((a, i) => ({
    ...a,
    value: vault.weights[i] * 100,
    weight: vault.weights[i] * 100,
    apr: +(a.apr * 100).toFixed(2),
    baseAPR: +(a.baseAPR * 100).toFixed(2),
  }));
  const apr = useVaultAPR(vault.id);
  const isLoadingApr = apr === 0;
  const {
    wrappedBalance: { displayed },
  } = useVaultUserBalance(vault.id);
  const { isMobile } = useBreakpoints();

  useVaultRegistrar(vault.id);
  const shortenAmount = (amount: string) => {
    let shortenedAmount: string | number = +toFixed(parseFloat(amount), 3)
    if (shortenedAmount !== parseFloat(amount)) {
      shortenedAmount = `${shortenedAmount}…`
    }
    return shortenedAmount
  }
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
            {!isMobile && (
              <Typography.Text type="success">
                <Tooltip title={`${displayed} ${vault.symbol}`}>
                  {shortenAmount(displayed)}
                </Tooltip>{" "}
                {vault.symbol}
              </Typography.Text>
            )}
          </Typography.Title>
          {isMobile && (
            <Typography.Title type="success" level={3}>
              <Tooltip title={`${displayed} ${vault.symbol}`}>
                  {shortenAmount(displayed)}
              </Tooltip>{" "}
              {vault.symbol}
            </Typography.Title>
          )}
        </Space>
      }
    >
      <Row gutter={24}>
        {/* Core Stats */}
        <Col xs={24} md={6}>
          {/* Protocols */}
          <CoreInformationSection title="Protocols">
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
          <CoreInformationSection title="TVL" tooltip="Total Value Locked">
            <Typography.Title level={1}>${vault.usdValue}</Typography.Title>
          </CoreInformationSection>
          {/* APR */}
          <CoreInformationSection title="APR" tooltip="Annual Percentage Rate">
            <Typography.Title level={1} type="success">
              {isLoadingApr ? <Spin /> : convert.toPercent(apr / 100)}
            </Typography.Title>
          </CoreInformationSection>
        </Col>
        {/* Chart */}
        <Col xs={24} md={10}>
          <CoreInformationSection title="Breakdown">
            <div
              style={{
                position: "relative",
                width: 400,
                height: 400,
                marginBottom: 80,
                transform: isMobile ? "scale(1.0)" : "scale(1.7)",
                transformOrigin: 0,
              }}
            >
              <VaultAdapterPieChart data={chartData} />
            </div>
          </CoreInformationSection>
        </Col>
        {/* Form */}
        <Col xs={24} md={8}>
          <VaultForm vault={vault} />
        </Col>
      </Row>
    </Page>
  );
}
