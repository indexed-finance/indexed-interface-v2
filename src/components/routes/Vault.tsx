import { Card, Col, Divider, Progress, Row, Typography } from "antd";
import {
  Label,
  Page,
  VaultAdapterPieChart,
  VaultCard,
} from "components/atomic";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useParams } from "react-router";
import { useVault } from "hooks";
import type { FormattedVault } from "features";

export function LoadedVault(props: FormattedVault) {
  const chartData = props.adapters.map(
    ({ protocol, percentage, annualPercentageRate }) => ({
      name: protocol,
      value: percentage,
      apr: annualPercentageRate,
    })
  );

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
      <div style={{ width: 600, height: 300, textTransform: "uppercase" }}>
        <VaultAdapterPieChart data={chartData} />
      </div>
    </Page>
  );
}

export default function Vault() {
  const { slug } = useParams<{ slug: string }>();
  const vault = useVault(slug);

  return vault ? <LoadedVault {...vault} /> : null;
}
