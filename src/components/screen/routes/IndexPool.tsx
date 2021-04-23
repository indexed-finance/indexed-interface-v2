import { AppState, selectors } from "features";
import {
  Button,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  ChartCard,
  Performance,
  Progress,
  Quote,
  Token,
} from "components/atomic";
import { FaCaretRight } from "react-icons/fa";
import { useParams } from "react-router";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

const MAXIMUM_DISPLAYED_TRADES = 8;

export default function Pool() {
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
  const trades = indexPool
    ? indexPool.transactions.trades.slice(0, MAXIMUM_DISPLAYED_TRADES)
    : [];

  usePoolDetailRegistrar(poolId ?? "", tokenIds);

  if (indexPool) {
    return (
      <>
        <Performance indexPool={indexPool} />
        <Row gutter={24}>
          <Col span={14}>
            {poolId && <ChartCard poolId={poolId} />}
            <Divider />
            <Card
              title={
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    Recent Trades
                  </Typography.Title>
                  <Space>
                    <Typography.Text type="secondary">
                      <em>
                        Showing {trades.length} of{" "}
                        {indexPool.transactions.trades.length}
                      </em>
                    </Typography.Text>
                    <Divider type="vertical" />
                    <Button type="ghost" size="large">
                      <Space>
                        <span>View more </span>
                        <FaCaretRight
                          style={{ position: "relative", top: 2 }}
                        />
                      </Space>
                    </Button>
                  </Space>
                </Space>
              }
            >
              <List size="small">
                {trades.map((trade) => (
                  <List.Item key={trade.transactionHash}>
                    <a
                      href={`https://etherscan.io/tx/${trade.transactionHash}`}
                      rel="noopener noreferrer"
                      target="_blank"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flex: 1,
                      }}
                    >
                      <Space style={{ width: "100%" }}>
                        <Token
                          name=""
                          symbol={trade.from}
                          image=""
                          address={indexPool.id}
                        />
                        <Divider style={{ margin: 0 }}>
                          <Typography.Text
                            type={trade.kind === "buy" ? "success" : "danger"}
                          >
                            sold for
                          </Typography.Text>
                        </Divider>
                        <Token
                          name=""
                          symbol={trade.to}
                          image=""
                          address={indexPool.id}
                        />
                        <Divider style={{ margin: 0 }}>{trade.when}</Divider>
                      </Space>
                      <Space size="large">
                        <Typography.Text
                          type={trade.kind === "buy" ? "success" : "danger"}
                        >
                          {trade.amount}
                        </Typography.Text>
                        <Button type="ghost">
                          <img
                            src={require("images/etherscan-link.png").default}
                            alt="View on Etherscan"
                            style={{
                              position: "relative",
                              top: -2,
                              width: 18,
                              height: 18,
                            }}
                          />
                        </Button>
                      </Space>
                    </a>
                  </List.Item>
                ))}
              </List>
            </Card>
          </Col>
          <Col span={10}>
            {indexPool && (
              <Card
                title={
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Typography.Title level={3} style={{ margin: 0 }}>
                      Assets
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      <em>Total of {indexPool.assets.length}</em>
                    </Typography.Text>
                  </Space>
                }
              >
                <List>
                  {indexPool.assets.map((asset) => (
                    <List.Item key={asset.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Token
                            name={asset.name}
                            image=""
                            address={asset.id}
                            symbol={asset.symbol}
                            amount={asset.balance}
                            size="small"
                          />
                          <Typography.Text type="success">
                            {asset.balanceUsd}
                          </Typography.Text>
                        </div>
                        <div
                          style={{
                            flex: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Quote
                            price={asset.price}
                            netChange={asset.netChange}
                            netChangePercent={asset.netChangePercent}
                            kind="small"
                            centered={true}
                          />
                        </div>
                        <Progress
                          style={{ flex: 1, textAlign: "right" }}
                          width={80}
                          status="active"
                          type="dashboard"
                          percent={parseFloat(
                            asset.weightPercentage.replace(/%/g, "")
                          )}
                        />
                      </div>
                    </List.Item>
                  ))}
                </List>
              </Card>
            )}
          </Col>
        </Row>
      </>
    );
  } else {
    return <Spin />;
  }
}
