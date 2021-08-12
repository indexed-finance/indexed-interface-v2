import { Label } from "components/atomic";
import { List, Typography } from "antd";
import { PortfolioCard } from "./PortfolioCard";

export function VVaultCard() {
  return (
    <PortfolioCard
      amount="X.XX"
      symbol="DAI"
      name="DAI"
      usdValue="USD $200.00"
      extra={<Typography.Title level={3}>4.20% APR</Typography.Title>}
      actions={[
        <List key="list">
          <List.Item>
            <Label>Earned</Label>
            USD $4.20
          </List.Item>
        </List>,
      ]}
    />
  );
}
