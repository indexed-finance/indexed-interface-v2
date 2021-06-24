import { Card, Col, Row, Typography } from "antd";
import { Page } from "components/atomic";

interface FormattedVault {
  symbol: string;
  name: string;
  totalValueLocked: string;
  annualPercentageRate: string;
  ndxPerDay: string;
  poweredBy: string;
  percentageOfVaultAssets: string;
  amountOfTokensInProtocol: string;
}

export function LoadedVault(props: FormattedVault) {
  return (
    <Page hasPageHeader={true} title="Vault">
      <Typography.Title level={1}>{props.name}</Typography.Title>
      <Row>
        <Col xs={24}>
          <Card>
            <Card.Meta title="Foo" description="Bar" />
          </Card>
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
    ndxPerDay: "1337.00",
    poweredBy: "Sushiswap",
    percentageOfVaultAssets: "100.0%",
    amountOfTokensInProtocol: "42,069",
  };

  return <LoadedVault {...formattedVault} />;
}
