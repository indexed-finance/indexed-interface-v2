import { AppState, selectors } from "features";
import { ChartCard, Performance } from "components";
import { Col, Row, Spin } from "antd";
import { useParams } from "react-router";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

export default function Pool() {
  const { slug } = useParams<{ slug: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, slug)
  );
  const pool = useSelector((state: AppState) =>
    poolId ? selectors.selectFormattedIndexPool(state, poolId) : null
  );
  const tokenIds = useSelector((state: AppState) =>
    poolId ? selectors.selectPoolTokenIds(state, poolId) : []
  );

  usePoolDetailRegistrar(poolId ?? "", tokenIds);

  if (pool) {
    return (
      <Row gutter={24}>
        {poolId && (
          <Col span={14}>
            <ChartCard poolId={poolId} />
          </Col>
        )}
        {pool && (
          <>
            <Col span={4}>
              <Performance pool={pool} direction="vertical" />
            </Col>
            <Col span={6}>Assets</Col>
          </>
        )}
      </Row>
    );
    return <div style={{ background: "black", minHeight: 500 }}>Hi</div>;
  } else {
    return <Spin />;
  }

  return <p>Pool</p>;
}
