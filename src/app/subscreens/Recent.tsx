import { AiOutlineClockCircle } from "react-icons/ai";
import { Button, Card, Skeleton, Space, Tabs, Tag, Typography } from "antd";
import { ImArrowRight2 } from "react-icons/im";
import { ReactNode, useState } from "react";
import Subscreen from "./Subscreen";
import type { FormattedIndexPool, Swap, Trade } from "features";

function BaseCard({
  when,
  from,
  to,
  transactionHash,
  title = null,
  extra = null,
}: Swap & { title?: ReactNode; extra?: ReactNode }) {
  return (
    <Card
      size="small"
      title={title}
      extra={
        <div>
          <AiOutlineClockCircle /> {when}
        </div>
      }
      actions={[
        <Button
          key="tx"
          type="link"
          target="_blank"
          rel="noopener noreferer"
          href={`https://etherscan.com/tx/${transactionHash}`}
        >
          View Transaction
        </Button>,
      ]}
    >
      <Space align="center">
        <div>{from}</div>
        <ImArrowRight2 />
        <div>{to}</div>
      </Space>
      {extra}
    </Card>
  );
}

function TradeCard(props: Trade) {
  const { amount, kind, ...rest } = props;

  return (
    <BaseCard
      title={<Tag color={kind === "buy" ? "green" : "red"}>{kind}</Tag>}
      extra={
        <div>
          <Typography.Text type={kind === "sell" ? "danger" : "success"}>
            {amount}
          </Typography.Text>
        </div>
      }
      {...rest}
    />
  );
}

function SwapCard(props: Swap) {
  return <BaseCard {...props} />;
}

const { TabPane } = Tabs;

export default function Recent({ pool }: { pool: FormattedIndexPool }) {
  const [mode, setMode] = useState("Trades");
  const tradesEmpty = pool.recent.trades.length === 0;
  const swapsEmpty = pool.recent.swaps.length === 0;
  const placeholders = Array.from({ length: 10 }, (_, index) => (
    <Skeleton key={index} active={true} />
  ));

  return (
    <Subscreen title="Recent" padding={0}>
      <Tabs
        size="large"
        centered={true}
        activeKey={mode}
        onChange={(next) => setMode(next)}
      >
        <TabPane tab="Trades" key="Trades">
          {tradesEmpty
            ? placeholders
            : pool.recent.trades.map((trade, index) => (
                <TradeCard key={index} {...trade} />
              ))}
        </TabPane>
        <TabPane tab="Swaps" key="Swaps">
          {swapsEmpty
            ? placeholders
            : pool.recent.swaps.map((swap, index) => (
                <SwapCard key={index} {...swap} />
              ))}
        </TabPane>
      </Tabs>
    </Subscreen>
  );
}
