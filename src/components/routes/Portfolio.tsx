import { Col, Row, Space, Typography } from "antd";
import { Page, PortfolioWidget } from "components/atomic";
import { useMemo } from "react";
import { usePortfolioData, useStakingRegistrar, useTranslator } from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  const { ndx, tokens, totalValue } = usePortfolioData();
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);

  useStakingRegistrar();

  return (
    <Page
      hasPageHeader={true}
      title={tx("PORTFOLIO")}
      actions={
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginRight: "5rem",
            padding: 12,
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            {tx("TOTAL_VALUE")}
          </Typography.Title>
          <Typography.Title type="success" level={3} style={{ margin: 0 }}>
            {totalValue}
          </Typography.Title>
        </Space>
      }
    >
      <Row gutter={[20, 20]}>
        {data.map((heldAsset) => (
          <Col xs={24} sm={8} key={heldAsset.address}>
            <PortfolioWidget {...heldAsset} />
          </Col>
        ))}
      </Row>
    </Page>
  );
}
