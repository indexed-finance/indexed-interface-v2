import { AiOutlineSwap } from "react-icons/ai";
import { FaCoins, FaFireAlt, FaHammer } from "react-icons/fa";
import { SwapInteraction, TradeInteraction } from "./interactions";
import { Tabs } from "antd";
import React, { useState } from "react";
import styled from "styled-components";
import type { FormattedIndexPool } from "features";

export type PoolInteraction = "burn" | "mint" | "swap" | "trade";

interface Props {
  pool: null | FormattedIndexPool;
  initial?: PoolInteraction;
}

export default function PoolInteractions({ pool, initial = "swap" }: Props) {
  const [interaction, setInteraction] = useState<PoolInteraction>(initial);

  return (
    <S.Tabs
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
              <S.TabWrapper>
                <FaCoins /> <span>Trade</span>
              </S.TabWrapper>
            }
            key="trade"
          >
            <TradeInteraction pool={pool} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <S.TabWrapper>
                <FaHammer /> <span>Mint</span>
              </S.TabWrapper>
            }
            key="mint"
          >
            {/* <MintForm pool={pool} /> */}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <S.TabWrapper>
                <FaFireAlt /> <span>Burn</span>
              </S.TabWrapper>
            }
            key="burn"
          >
            {/* <BurnForm /> */}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <S.TabWrapper>
                <AiOutlineSwap /> <span>Swap</span>
              </S.TabWrapper>
            }
            key="swap"
          >
            <SwapInteraction pool={pool} />
          </Tabs.TabPane>
        </>
      )}
    </S.Tabs>
  );
}

const S = {
  Tabs: styled(Tabs)`
    [role="tab"] {
      font-size: 12px;
    }

    padding-top: 0;
    padding-left: 24px;
    padding-right: 24px;
    margin-bottom: 48px;

    .ant-tabs-tab:nth-child(4) {
      margin-right: 0;
    }
  `,
  TabWrapper: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};

    span {
      margin-left: ${(props) => props.theme.spacing.small};
    }
  `,
};
