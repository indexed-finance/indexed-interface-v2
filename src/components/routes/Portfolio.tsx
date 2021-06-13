import { Checkbox, Col, Row, Space, Typography } from "antd";
import { Page, PortfolioWidget } from "components/atomic";
import { useMemo, useState } from "react";
import {
  useNewStakingRegistrar,
  usePortfolioData,
  useStakingRegistrar,
  useTranslator,
} from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  const [showOwnedAssets, setShowOwnedAssets] = useState(true);
  const { ndx, tokens, totalValue } = usePortfolioData({
    onlyOwnedAssets: showOwnedAssets,
  });
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);

  useStakingRegistrar();
  useNewStakingRegistrar();

  return (
    <Page
      hasPageHeader={true}
      title={tx("PORTFOLIO")}
      extra={
        <Checkbox
          checked={showOwnedAssets}
          onChange={(value) => setShowOwnedAssets(value.target.checked)}
        >
          Only show owned or staked assets
        </Checkbox>
      }
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
          <Col xs={24} sm={6} key={heldAsset.address}>
            <PortfolioWidget {...heldAsset} />
          </Col>
        ))}
      </Row>
    </Page>
  );
}
