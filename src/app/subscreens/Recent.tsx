import { Skeleton, Tabs } from "antd";
import { Subscreen } from "./Subscreen";
import { TransactionCard } from "components";
import { useState } from "react";
import { useTranslator } from "hooks";
import type { FormattedIndexPool } from "features";

const { TabPane } = Tabs;

export function Recent({ pool }: { pool: FormattedIndexPool }) {
  const tx = useTranslator();
  const [mode, setMode] = useState("Trades");
  const tradesEmpty = pool.transactions.trades.length === 0;
  const swapsEmpty = pool.transactions.swaps.length === 0;
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
        <TabPane tab={tx("TRADES")} key="Trades">
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
              : pool.transactions.trades.map((trade, index) => (
                  <div key={index} style={{ flex: "1 1 0", padding: 15 }}>
                    <TransactionCard {...trade} />
                  </div>
                ))}
          </div>
        </TabPane>
        <TabPane tab={tx("SWAPS")} key="Swaps">
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
              : pool.transactions.swaps.map((swap, index) => (
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
