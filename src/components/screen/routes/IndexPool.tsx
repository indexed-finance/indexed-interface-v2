import { AppState, selectors } from "features";
import { Col, Divider, Row, Space, Spin } from "antd";
import {
  IndexPoolAssets,
  IndexPoolChart,
  IndexPoolDescription,
  IndexPoolExternalLinks,
  IndexPoolRecentTrades,
} from "components/atomic";
import { useParams } from "react-router";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

export default function IndexPool() {
  const { slug } = useParams<{ slug: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, slug)
  );
  const indexPool = useSelector((state: AppState) =>
    poolId ? selectors.selectFormattedIndexPool(state, poolId) : null
  );
  const tokenIds = useSelector((state: AppState) =>
    poolId ? selectors.selectPoolTokenIds(state, poolId) : []
  );

  usePoolDetailRegistrar(poolId ?? "", tokenIds);

  if (indexPool) {
    return (
      <div style={{ paddingTop: 12 }}>
        <Row
          align="stretch"
          gutter={{
            xs: 12,
            sm: 24,
          }}
        >
          <Col xs={24} md={8}>
            <Space size="large" direction="vertical">
              <IndexPoolDescription {...indexPool} />
              <IndexPoolExternalLinks {...indexPool} />
            </Space>
          </Col>
          <Col xs={24} md={16}>
            {poolId && <IndexPoolChart poolId={poolId} />}
          </Col>
        </Row>
        <Divider />
        <Row
          gutter={{
            xs: 12,
            sm: 24,
          }}
        >
          <Col xs={24} md={10}>
            <IndexPoolAssets {...indexPool} />
          </Col>
          <Col xs={24} md={14}>
            <IndexPoolRecentTrades {...indexPool} />
          </Col>
        </Row>
      </div>
    );
  } else {
    return <Spin />;
  }
}
