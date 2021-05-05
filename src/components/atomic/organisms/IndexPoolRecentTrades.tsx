import { Button, Card, Divider, List, Space, Typography } from "antd";
import { FaCaretRight } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import { Token } from "components/atomic";

const MAXIMUM_DISPLAYED_TRADES = 8;

export function IndexPoolRecentTrades({
  id,
  transactions,
}: FormattedIndexPool) {
  const trades = transactions.trades.slice(0, MAXIMUM_DISPLAYED_TRADES);

  return (
    <Card
      title={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Recent Trades
          </Typography.Title>
          <Space>
            <Typography.Text type="secondary">
              <em>
                Showing {trades.length} of {transactions.trades.length}
              </em>
            </Typography.Text>
            <Divider type="vertical" />
            <Button type="ghost" size="large">
              <Space>
                <span>View more </span>
                <FaCaretRight style={{ position: "relative", top: 2 }} />
              </Space>
            </Button>
          </Space>
        </Space>
      }
    >
      <List size="small" style={{ maxWidth: 580 }}>
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
                <Token name="" symbol={trade.from} address={id} />
                <Typography.Text
                  type={trade.kind === "buy" ? "success" : "danger"}
                >
                  sold for
                </Typography.Text>
                <Token name="" symbol={trade.to} address={id} />
                {trade.when}
              </Space>

              <Typography.Text
                type={trade.kind === "buy" ? "success" : "danger"}
              >
                {trade.amount}
              </Typography.Text>
            </a>
          </List.Item>
        ))}
      </List>
    </Card>
  );
}
