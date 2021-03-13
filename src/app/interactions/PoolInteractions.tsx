import { AiOutlineSwap } from "react-icons/ai";
import { FaCoins, FaFireAlt, FaHammer } from "react-icons/fa";
import { Tabs, Typography } from "antd";
import { useState } from "react";
import SwapInteraction from "./SwapInteraction";
import TradeInteraction from "./TradeInteraction";
import type { FormattedIndexPool } from "features";

export type PoolInteraction = "burn" | "mint" | "swap" | "trade";

interface Props {
  pool: null | FormattedIndexPool;
  initial?: PoolInteraction;
}

export default function PoolInteractions({ pool, initial = "swap" }: Props) {
  const [interaction, setInteraction] = useState<PoolInteraction>(initial);

  return (
    <div style={{ position: "relative" }}>
      <Typography.Title
        level={2}
        className="fancy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {interaction}
      </Typography.Title>
      <Tabs
        centered={true}
        tabPosition="right"
        activeKey={interaction}
        onChange={(nextInteraction) => {
          const next = nextInteraction as PoolInteraction;
          setInteraction(next);
        }}
      >
        {pool && (
          <>
            <Tabs.TabPane
              tab={
                <div>
                  <FaCoins /> <span>Trade</span>
                </div>
              }
              key="trade"
            >
              <TradeInteraction pool={pool} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <div>
                  <FaHammer /> <span>Mint</span>
                </div>
              }
              key="mint"
            >
              {/* <MintForm pool={pool} /> */}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <div>
                  <FaFireAlt /> <span>Burn</span>
                </div>
              }
              key="burn"
            >
              {/* <BurnForm /> */}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <div>
                  <AiOutlineSwap /> <span>Swap</span>
                </div>
              }
              key="swap"
            >
              <SwapInteraction pool={pool} />
            </Tabs.TabPane>
          </>
        )}
      </Tabs>
    </div>
  );
}
