import { AiOutlineSwap } from "react-icons/ai";
import { FaCoins, FaFireAlt, FaHammer } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { Tabs } from "antd";
import { useBreakpoints } from "helpers";
import { useTranslation } from "i18n";
import BurnInteraction from "./BurnInteraction";
import MintInteraction from "./MintInteraction";
import SwapInteraction from "./SwapInteraction";
import TradeInteraction from "./TradeInteraction";
import type { FormattedIndexPool } from "features";

export type PoolInteraction =
  | "burn"
  | "multiBurn"
  | "uniswapMint"
  | "mint"
  | "multiMint"
  | "uniswapMint"
  | "swap"
  | "trade";

interface Props {
  pool: null | FormattedIndexPool;
  initial?: PoolInteraction;
}

export default function PoolInteractions({ pool }: Props) {
  const translate = useTranslation();
  const { poolName, interaction: activeInteraction = "swap" } = useParams<{
    poolName: string;
    interaction: PoolInteraction;
  }>();
  const { isMobile } = useBreakpoints();

  return (
    <Tabs
      type={isMobile ? "line" : "card"}
      size="large"
      centered={isMobile}
      tabPosition={isMobile ? "top" : "right"}
      activeKey={activeInteraction}
      destroyInactiveTabPane
    >
      {pool && (
        <>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="trade"
            tab={
              <Link to={`/pools/${poolName}/trade`}>
                <FaCoins /> {!isMobile && <span>{translate("TRADE")}</span>}
              </Link>
            }
          >
            <TradeInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="swap"
            tab={
              <Link to={`/pools/${poolName}/swap`}>
                <AiOutlineSwap />{" "}
                {!isMobile && <span>{translate("SWAP")}</span>}
              </Link>
            }
          >
            <SwapInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="mint"
            tab={
              <Link to={`/pools/${poolName}/mint`}>
                <FaHammer /> {!isMobile && <span>{translate("MINT")}</span>}
              </Link>
            }
          >
            <MintInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            style={{ padding: 20 }}
            key="burn"
            tab={
              <Link to={`/pools/${poolName}/burn`}>
                <FaFireAlt /> {!isMobile && <span>{translate("BURN")}</span>}
              </Link>
            }
          >
            <BurnInteraction pool={pool} />
          </Tabs.TabPane>
        </>
      )}
    </Tabs>
  );
}
