import { Label } from "components/atomic";
import { List } from "antd";
import { PortfolioCard } from "./PortfolioCard";

export function IndexCard() {
  return (
    <PortfolioCard
      amount="X.XX"
      symbol="DEFI5"
      name="DEFI5"
      usdValue="USD $200.00"
      actions={[
        <List key="list">
          <List.Item>
            <Label>Currently staking</Label>
            X.XX DEFI5
          </List.Item>
          <List.Item>
            <Label>Earned</Label>
            X.XX NDX
          </List.Item>
          <List.Item>
            <Label>Ready to claim</Label>
            X.XX NDX{" "}
          </List.Item>
        </List>,
      ]}
    />
  );
}
