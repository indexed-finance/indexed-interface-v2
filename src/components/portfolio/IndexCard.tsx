import { Label } from "components/atomic";
import { List } from "antd";
import { PortfolioCard } from "./PortfolioCard";
import { usePoolDetailRegistrar, usePoolTokenIds } from "hooks";

interface Props {
  address: string;
  symbol: string;
  name: string;
  amount: string;
  usdValue: string;
  hasStakingPool: boolean;
  staking?: string;
  earnedAmount?: string;
  earnedSymbol: string;
}

export function IndexCard({
  address,
  symbol,
  name,
  amount,
  usdValue,
  hasStakingPool,
  staking = "0.00",
  earnedAmount = "0.00",
  earnedSymbol,
}: Props) {
  const tokenIds = usePoolTokenIds(address);
  const actualSymbol = ["UNIV2:", "SUSHI:"].some((prefix) =>
    symbol.startsWith(prefix)
  )
    ? symbol.split(":")[1].replace(/-/g, "/")
    : symbol;

  usePoolDetailRegistrar(address, tokenIds);

  return (
    <PortfolioCard
      amount={amount}
      symbol={actualSymbol}
      name={name}
      usdValue={`USD ${usdValue}`}
      actions={
        hasStakingPool
          ? [
              <List key="list">
                <List.Item>
                  <Label>Asset</Label>
                  {name}
                </List.Item>
                <List.Item>
                  <Label>Currently staking</Label>
                  {staking || "0.00"} {actualSymbol}
                </List.Item>
                <List.Item>
                  <Label>Rewards ready to claim</Label>
                  {earnedAmount} {earnedSymbol}
                </List.Item>
              </List>,
            ]
          : []
      }
    />
  );
}
