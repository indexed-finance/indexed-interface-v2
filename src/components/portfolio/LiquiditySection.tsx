import { Col, Row } from "antd";
import { LiquidityCard } from "./LiquidityCard";
import { PortfolioSection } from "./PortfolioSection";
import {
  useMasterChefRegistrar,
  useNewStakingRegistrar,
  useStakingRegistrar,
} from "hooks";

export function LiquiditySection() {
  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  return (
    <PortfolioSection title="Liquidity" usdValue="USD $10,000.00">
      <Row gutter={12} align="bottom">
        <Col span={8}>
          <LiquidityCard />
        </Col>
        <Col span={8}>
          <LiquidityCard />
        </Col>
        <Col span={8}>
          <LiquidityCard />
        </Col>
      </Row>
    </PortfolioSection>
  );
}
