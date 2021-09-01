import { PortfolioSection } from "./PortfolioSection";
import { Row } from "antd";
import { VVaultCard } from "./VaultCard";
import { useAllVaults } from "hooks";

export function VaultSection() {
  const vaults = useAllVaults();

  return (
    <PortfolioSection title="Vaults">
      <Row gutter={12} align="bottom">
        {vaults.map((vault) => (
          <VVaultCard key={vault.id} address={vault.id} />
        ))}
      </Row>
    </PortfolioSection>
  );
}
