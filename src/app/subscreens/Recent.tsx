import { Skeleton, Tabs } from "antd";
import { TransactionCard } from "components";
import { useState } from "react";
import Subscreen from "./Subscreen";
import type { FormattedIndexPool } from "features";

const { TabPane } = Tabs;

export default function Recent({ pool }: { pool: FormattedIndexPool }) {
  const [mode, setMode] = useState("Trades");
  const tradesEmpty = pool.recent.trades.length === 0;
  const swapsEmpty = pool.recent.swaps.length === 0;
  const placeholders = Array.from({ length: 10 }, (_, index) => (
    <Skeleton key={index} active={true} />
  ));

  return (
    <Subscreen title="Recent">
      <Tabs
        className="Recent"
        size="large"
        centered={true}
        activeKey={mode}
        onChange={(next) => setMode(next)}
      >
        <TabPane tab="Trades" key="Trades">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {tradesEmpty
              ? placeholders
              : pool.recent.trades.map((trade, index) => (
                  <div key={index} style={{ flex: "1 1 0", padding: 15 }}>
                    <TransactionCard {...trade} />
                  </div>
                ))}
          </div>
        </TabPane>
        <TabPane tab="Swaps" key="Swaps">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {swapsEmpty
              ? placeholders
              : pool.recent.swaps.map((swap, index) => (
                  <div key={index} style={{ flex: "1 1 0", padding: 15 }}>
                    <TransactionCard key={index} {...swap} kind="swap" />
                  </div>
                ))}
          </div>
        </TabPane>
      </Tabs>
    </Subscreen>
  );
}
