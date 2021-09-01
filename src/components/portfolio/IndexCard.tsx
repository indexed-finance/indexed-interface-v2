import { Label } from "components/atomic";
import { List } from "antd";
import { PortfolioCard } from "./PortfolioCard";
import { usePoolDetailRegistrar, usePoolTokenIds } from "hooks";

interface Props {
  address: string;
  symbol: string;
  name: string;
  walletAmount: string;
  walletUsdValue: string;
  accruedSymbol?: string;
  accruedAmount?: string;
  accruedUsdValue?: string;
  stakingAmount?: string;
  stakingUsdValue?: string;
  hasStakingPool: boolean;
  staking?: string;
  earnedAmount?: string;
  earnedSymbol: string;
}

export function IndexCard({
  address,
  symbol,
  name,
  walletAmount,
  walletUsdValue,
  accruedSymbol,
  accruedAmount,
  accruedUsdValue,
  stakingAmount,
  stakingUsdValue,
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
      walletAmount={walletAmount}
      walletUsdValue={walletUsdValue}
      accruedSymbol={accruedSymbol}
      accruedAmount={accruedAmount}
      accruedUsdValue={accruedUsdValue}
      stakingAmount={stakingAmount}
      stakingUsdValue={stakingUsdValue}
      symbol={actualSymbol}
      name={name}
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
