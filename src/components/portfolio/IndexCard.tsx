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

  usePoolDetailRegistrar(address, tokenIds);

  return (
    <PortfolioCard
      amount={amount}
      symbol={symbol}
      name={name}
      usdValue={`USD ${usdValue}`}
      actions={
        hasStakingPool
          ? [
              <List key="list">
                <List.Item>
                  <Label>Currently staking</Label>
                  {staking} {symbol}
                </List.Item>
                <List.Item>
                  <Label>Earned</Label>
                  {earnedAmount} {earnedSymbol}
                </List.Item>
                <List.Item>
                  <Label>Ready to claim</Label>
                  X.XX NDX{" "}
                </List.Item>
              </List>,
            ]
          : []
      }
    />
  );
}
