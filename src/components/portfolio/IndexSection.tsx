import { Col, Row } from "antd";
import { IndexCard } from "./IndexCard";
import { PortfolioSection } from "./PortfolioSection";

export function IndexSection() {
  return (
    <PortfolioSection title="Indexes" usdValue="USD $10,000.00">
      <Row gutter={12} align="bottom">
        <Col span={8}>
          <IndexCard />
        </Col>
        <Col span={8}>
          <IndexCard />
        </Col>
        <Col span={8}>
          <IndexCard />
        </Col>
      </Row>
    </PortfolioSection>
  );
}
