import { Card, List, Space, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Token } from "components/atomic";
import { useBreakpoints } from "hooks";

const MAXIMUM_DISPLAYED_TRADES = 8;

export function IndexPoolRecentTrades({
  id,
  transactions,
}: FormattedIndexPool) {
  const trades = transactions.trades.slice(0, MAXIMUM_DISPLAYED_TRADES);
  const { isMobile } = useBreakpoints();

  return (
    <Card
      title={
        <Typography.Title level={3} style={{ margin: 0 }}>
          Recent Trades
        </Typography.Title>
      }
    >
      <List size="small" style={{ maxWidth: 580 }}>
        {trades.map((trade, index) => (
          <List.Item key={index}>
            <a
              href={`https://etherscan.io/tx/${trade.transactionHash}`}
              rel="noopener noreferrer"
              target="_blank"
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-end" : "center",
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
              </Space>

              <div>
                {trade.when} for{" "}
                <Typography.Text
                  type={trade.kind === "buy" ? "success" : "danger"}
                >
                  {trade.amount}
                </Typography.Text>
              </div>
            </a>
          </List.Item>
        ))}
      </List>
    </Card>
  );
}
