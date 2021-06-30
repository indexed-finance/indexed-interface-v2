import { Card, Col, Divider, Row, Typography } from "antd";
import { Page, VaultCard } from "components/atomic";

interface FormattedVault {
  symbol: string;
  name: string;
  totalValueLocked: string;
  annualPercentageRate: string;
  percentageOfVaultAssets: string;
  amountOfTokensInProtocol: string;
}

export function LoadedVault(props: FormattedVault) {
  return (
    <Page hasPageHeader={true} title="Vault">
      <VaultCard withTitle={true} bordered={false} hoverable={false} />
      <Divider />
      <Row>
        <Col xs={24}>
          <h1>The breakdown of protocols go here</h1>
        </Col>
      </Row>
    </Page>
  );
}

export default function Vault() {
  const formattedVault: FormattedVault = {
    symbol: "UNI",
    name: "Uniswap",
    totalValueLocked: "$52.2M",
    annualPercentageRate: "43.0%",
    percentageOfVaultAssets: "100.0%",
    amountOfTokensInProtocol: "42,069",
  };

  return <LoadedVault {...formattedVault} />;
}
