import { Button, Space, Statistic } from "antd";
import { FormattedIndexPool } from "features";
import { Quote } from "components";
import Subscreen from "./Subscreen";

export default function Performance({ pool }: { pool: FormattedIndexPool }) {
  return (
    <Subscreen title="Performance">
      <Space
        align="start"
        direction="horizontal"
        style={{
          width: "100%",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <Space direction="vertical">
          <Quote
            symbol={pool.symbol}
            price={pool.priceUsd}
            netChange={pool.netChange}
            netChangePercent={pool.netChangePercent}
            isNegative={pool.isNegative}
          />
          <Button type="primary">Stake pool</Button>
        </Space>
        <Space direction="vertical" style={{ textAlign: "right", flex: 1 }}>
          <Statistic title="Total Value Locked" value={pool.totalValueLocked} />
          <Statistic title="Volume" value={pool.volume} />
          <Statistic title="Cumulative Fees" value={pool.cumulativeFee} />
          <Statistic title="Swap Fee" value={pool.swapFee} />
        </Space>
      </Space>
    </Subscreen>
  );
}
