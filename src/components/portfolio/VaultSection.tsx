import { Col, Row } from "antd";
import { PortfolioSection } from "./PortfolioSection";
import { VVaultCard } from "./VaultCard";
import { convert } from "helpers";
import { useAllVaults, useBreakpoints } from "hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  onUsdValueChange(amount: number): void;
}

export function VaultSection({ onUsdValueChange }: Props) {
  const { isMobile } = useBreakpoints();
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
    <PortfolioSection title="Vaults" usdValue={convert.toCurrency(usdValue)}>
      <Row gutter={12} align="bottom">
        {vaults.map((vault) => (
          <Col
            key={vault.id}
            xs={24}
            lg={8}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <VVaultCard
              address={vault.id}
              onRegisterUsdValue={registerUsdValue}
            />
          </Col>
        ))}
      </Row>
    </PortfolioSection>
  );
}
