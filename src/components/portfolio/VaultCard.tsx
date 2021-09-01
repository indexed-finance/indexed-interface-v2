import { Col, List } from "antd";
import { Label } from "components/atomic";
import { PortfolioCard } from "./PortfolioCard";
import {
  useBreakpoints,
  useVault,
  useVaultAPR,
  useVaultRegistrar,
  useVaultUserBalance,
} from "hooks";

interface Props {
  address: string;
}

export function VVaultCard({ address }: Props) {
  const { isMobile } = useBreakpoints();
  const vault = useVault(address);
  const { wrappedBalance, usdValue } = useVaultUserBalance(address);
  const apr = useVaultAPR(address);
  const symbol = vault?.symbol ?? "";
  const name = vault?.name ?? "";

  useVaultRegistrar(address);

  return parseFloat(usdValue ?? "0.00") === 0 ? null : (
    <Col xs={24} lg={8} style={{ marginBottom: isMobile ? 12 : 0 }}>
      <PortfolioCard
        showStaking={false}
        walletAmount={shortenAmount(wrappedBalance.displayed).toString()}
        walletUsdValue={`$${usdValue}`}
        symbol={symbol}
        removeTheN={true}
        name={name}
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
    </Col>
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
