import { Label } from "components/atomic";
import { List } from "antd";
import { PortfolioCard } from "./PortfolioCard";
import { useEffect } from "react";
import {
  useVault,
  useVaultAPR,
  useVaultRegistrar,
  useVaultUserBalance,
} from "hooks";

interface Props {
  address: string;
  onRegisterUsdValue(id: string, amount: number): void;
}

export function VVaultCard({ address, onRegisterUsdValue }: Props) {
  const vault = useVault(address);
  const { wrappedBalance, usdValue } = useVaultUserBalance(address);
  const apr = useVaultAPR(address);
  const symbol = vault?.symbol ?? "";
  const name = vault?.name ?? "";

  useEffect(() => {
    if (usdValue) {
      onRegisterUsdValue(address, parseFloat(usdValue));
    }
  }, [address, usdValue, onRegisterUsdValue]);

  useVaultRegistrar(address);

  return parseFloat(usdValue ?? "0.00") === 0 ? null : (
    <PortfolioCard
      amount={shortenAmount(wrappedBalance.displayed).toString()}
      symbol={symbol}
      removeTheN={true}
      name={name}
      usdValue={`$${usdValue}`}
      actions={[
        <List key="list">
          <List.Item>
            <Label>Vault</Label>
            {name}
          </List.Item>
          <List.Item>
            <Label>APR</Label>
            {apr}%
          </List.Item>
          <List.Item>
            <Label>Earned</Label>${usdValue}
          </List.Item>
        </List>,
      ]}
    />
  );
}

// #region Helpers
function toFixed(num: number, fixed: number) {
  const re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  const res = num.toString().match(re);
  return res ? res[0] : "";
}

function shortenAmount(amount: string) {
  let shortenedAmount: string | number = +toFixed(parseFloat(amount), 3);
  if (shortenedAmount !== parseFloat(amount)) {
    shortenedAmount = `${shortenedAmount}…`;
  }
  return shortenedAmount;
}
// #endregion
