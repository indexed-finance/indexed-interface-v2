import { AiOutlineSwap } from "react-icons/ai";
import { FaCoins, FaFireAlt, FaHammer } from "react-icons/fa";
import { SwapInteraction, TradeInteraction } from "./interactions";
import { Tabs } from "antd";
import { useState } from "react";
import type { FormattedIndexPool } from "features";

export type PoolInteraction = "burn" | "mint" | "swap" | "trade";

interface Props {
  pool: null | FormattedIndexPool;
  initial?: PoolInteraction;
}

export default function PoolInteractions({ pool, initial = "swap" }: Props) {
  const [interaction, setInteraction] = useState<PoolInteraction>(initial);

  return (
    <Tabs
      centered={true}
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
  );
}
