import { AiOutlineArrowRight } from "react-icons/ai";
import { Card, List, Space, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { Token } from "components/atomic/atoms";
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
      <List size="small">
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
              <Space>
                <Token
                  name=""
                  symbol={trade.from}
                  address={trade.fromAddress}
                />
                <Typography.Text
                  style={{ fontSize: 20 }}
                  type={trade.kind === "buy" ? "success" : "danger"}
                >
                  <AiOutlineArrowRight />
                </Typography.Text>
                <Token name="" symbol={trade.to} address={trade.toAddress} />
              </Space>

              <div>
                {trade.when} for{" "}
                <Typography.Text
                  style={{ marginLeft: 12 }}
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
