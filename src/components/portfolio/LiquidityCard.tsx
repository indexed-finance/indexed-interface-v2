import { Label } from "components/atomic";
import { List } from "antd";
import { PortfolioCard } from "./PortfolioCard";

export function LiquidityCard() {
  return (
    <PortfolioCard
      amount="X.XX"
      symbol="WETH:DEGEN"
      name="WETH:DEGEN"
      usdValue="USD $200.00"
      actions={[
        <List key="list">
          <List.Item>
            <Label>Currently staking</Label>
            X.XX WETH:DEGEN
          </List.Item>
          <List.Item>
            <Label>Earned</Label>
            X.XX NDX
          </List.Item>
          <List.Item>
            <Label>Ready to claim</Label>
            X.XX NDX
          </List.Item>
        </List>,
      ]}
    />
  );
}
