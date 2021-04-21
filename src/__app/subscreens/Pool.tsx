import { AppState, selectors } from "features";
import { Button, Col, Divider, List, Row, Space, Spin, Typography } from "antd";
import { ChartCard, Performance } from "components";
import { FaCaretRight } from "react-icons/fa";
import { useParams } from "react-router";
import { usePoolDetailRegistrar, useTranslator } from "hooks";
import { useSelector } from "react-redux";

const MAXIMUM_DISPLAYED_TRADES = 4;

export default function Pool() {
  const tx = useTranslator();
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
  const trades = pool
    ? pool.transactions.trades.slice(0, MAXIMUM_DISPLAYED_TRADES)
    : [];

  usePoolDetailRegistrar(poolId ?? "", tokenIds);

  if (pool) {
    return (
      <>
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
        <Divider />
        <Row gutter={24}>
          <Col span={24}>
            <Typography.Title level={3}>Recent Trades</Typography.Title>
            <List
              itemLayout="vertical"
              loadMore={
                <Typography.Paragraph style={{ textAlign: "right" }}>
                  <Button type="ghost" size="large">
                    <Space>
                      <span>View more </span>
                      <FaCaretRight style={{ position: "relative", top: 2 }} />
                    </Space>
                  </Button>
                </Typography.Paragraph>
              }
              style={{ width: "100%", overflow: "auto" }}
            >
              {trades.map((trade) => (
                <List.Item key={trade.transactionHash}>
                  {JSON.stringify(trade, null, 2)}
                </List.Item>
              ))}
            </List>
          </Col>
        </Row>
      </>
    );
  } else {
    return <Spin />;
  }
}
