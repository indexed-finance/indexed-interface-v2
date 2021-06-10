import { Checkbox, Col, Row, Typography } from "antd";
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
        <>
          <div style={{ display: "flex" }}>
            <Typography.Title
              level={3}
              style={{ margin: 0, marginRight: "1rem" }}
            >
              {tx("TOTAL_VALUE")}
            </Typography.Title>
            <Typography.Title type="success" level={3} style={{ margin: 0 }}>
              {totalValue}
            </Typography.Title>
          </div>
          <Checkbox
            checked={showOwnedAssets}
            onChange={(value) => setShowOwnedAssets(value.target.checked)}
          >
            Only show owned or staked assets
          </Checkbox>
        </>
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
