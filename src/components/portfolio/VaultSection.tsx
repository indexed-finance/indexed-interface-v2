import { Col, Row } from "antd";
import { PortfolioSection } from "./PortfolioSection";
import { VVaultCard } from "./VaultCard";

export function VaultSection() {
  return (
    <PortfolioSection title="Vaults" usdValue="USD $10,000.00">
      <Row gutter={12} align="bottom">
        <Col span={8}>
          <VVaultCard />
        </Col>
        <Col span={8}>
          <VVaultCard />
        </Col>
        <Col span={8}>
          <VVaultCard />
        </Col>
      </Row>
    </PortfolioSection>
  );
}
