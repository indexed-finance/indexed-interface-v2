import { PortfolioSection } from "./PortfolioSection";
import { Row } from "antd";
import { VVaultCard } from "./VaultCard";
import { convert } from "helpers";
import { useAllVaults } from "hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  onUsdValueChange(amount: number): void;
}

export function VaultSection({ onUsdValueChange }: Props) {
  const vaults = useAllVaults();
  const [usdValueByVault, setUsdValueByVault] = useState<
    Record<string, number>
  >({});
  const registerUsdValue = useCallback(
    (id: string, amount: number) =>
      setUsdValueByVault((prev) => ({
        ...prev,
        [id]: amount,
      })),
    []
  );
  const usdValue = useMemo(
    () => Object.values(usdValueByVault).reduce((prev, next) => prev + next, 0),
    [usdValueByVault]
  );

  useEffect(() => {
    onUsdValueChange(usdValue);
  }, [onUsdValueChange, usdValue]);

  return (
    <PortfolioSection
      title="Vaults"
      walletUsdValue={convert.toCurrency(usdValue)}
    >
      <Row gutter={12} align="bottom">
        {vaults.map((vault) => (
          <VVaultCard
            key={vault.id}
            address={vault.id}
            onRegisterUsdValue={registerUsdValue}
          />
        ))}
      </Row>
    </PortfolioSection>
  );
}
