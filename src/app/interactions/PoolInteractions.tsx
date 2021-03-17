import { AiOutlineSwap } from "react-icons/ai";
import { FaCoins, FaFireAlt, FaHammer } from "react-icons/fa";
import { Tabs } from "antd";
import { useBreakpoints } from "helpers";
import { useState } from "react";
import BurnInteraction from "./BurnInteraction";
import MintInteraction from "./MintInteraction";
import SwapInteraction from "./SwapInteraction";
import TradeInteraction from "./TradeInteraction";
import type { FormattedIndexPool } from "features";

export type PoolInteraction = "burn" | "mint" | "swap" | "trade";

interface Props {
  pool: null | FormattedIndexPool;
  initial?: PoolInteraction;
}

export default function PoolInteractions({ pool, initial = "trade" }: Props) {
  const [interaction, setInteraction] = useState<PoolInteraction>(initial);
  const { isMobile } = useBreakpoints();

  return (
    <Tabs
      type={isMobile ? "line" : "card"}
      size="large"
      centered={isMobile}
      tabPosition={isMobile ? "top" : "right"}
      activeKey={interaction}
      onChange={(nextInteraction) => {
        const next = nextInteraction as PoolInteraction;
        setInteraction(next);
      }}
    >
      {pool && (
        <>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="trade"
            tab={
              <>
                <FaCoins /> {!isMobile && <span>Trade</span>}
              </>
            }
          >
            <TradeInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="swap"
            tab={
              <>
                <AiOutlineSwap /> {!isMobile && <span>Swap</span>}
              </>
            }
          >
            <SwapInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="mint"
            tab={
              <>
                <FaHammer /> {!isMobile && <span>Mint</span>}
              </>
            }
          >
            <MintInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="burn"
            tab={
              <div>
                <FaFireAlt /> {!isMobile && <span>Burn</span>}
              </div>
            }
          >
            <BurnInteraction pool={pool} />
          </Tabs.TabPane>
        </>
      )}
    </Tabs>
  );
}
