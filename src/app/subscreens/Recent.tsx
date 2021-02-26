import { AiOutlineClockCircle, AiOutlineSwap } from "react-icons/ai";
import { Button } from "components";
import { Card, Skeleton, Space, Tabs, Tag } from "antd";
import { ImArrowRight2 } from "react-icons/im";
import React, { ReactNode, useState } from "react";
import Subscreen from "./Subscreen";
import styled from "styled-components";
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
    <S.Card
      size="small"
      title={title}
      extra={
        <S.Time>
          <S.TimeIcon /> {when}
        </S.Time>
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
      <S.Inner align="center">
        <div>{from}</div>
        <S.Arrow />
        <div>{to}</div>
      </S.Inner>
      {extra}
    </S.Card>
  );
}

function TradeCard(props: Trade) {
  const { amount, kind, ...rest } = props;

  return (
    <BaseCard
      title={<S.Tag color={kind === "buy" ? "green" : "red"}>{kind}</S.Tag>}
      extra={<S.Amount negative={kind === "sell"}>{amount}</S.Amount>}
      {...rest}
    />
  );
}

function SwapCard(props: Swap) {
  return <BaseCard {...props} />;
}

export default function Recent({ pool }: { pool: FormattedIndexPool }) {
  const [mode, setMode] = useState("Trades");
  const tradesEmpty = pool.recent.trades.length === 0;
  const swapsEmpty = pool.recent.swaps.length === 0;
  const placeholders = Array.from({ length: 10 }, (_, index) => (
    <S.Skeleton key={index} active={true} />
  ));

  return (
    <Subscreen icon={<AiOutlineSwap />} title="Recent" padding={0}>
      <S.Tabs
        size="large"
        centered={true}
        activeKey={mode}
        onChange={(next) => setMode(next)}
      >
        <S.TabPane tab="Trades" key="Trades">
          {tradesEmpty
            ? placeholders
            : pool.recent.trades.map((trade, index) => (
                <TradeCard key={index} {...trade} />
              ))}
        </S.TabPane>
        <S.TabPane tab="Swaps" key="Swaps">
          {swapsEmpty
            ? placeholders
            : pool.recent.swaps.map((swap, index) => (
                <SwapCard key={index} {...swap} />
              ))}
        </S.TabPane>
      </S.Tabs>
    </Subscreen>
  );
}

const S = {
  Tabs: styled(Tabs)`
    [role="tab"] {
      ${(props) => props.theme.snippets.fancy};
    }
  `,
  TabPane: styled(Tabs.TabPane)`
    ${(props) => props.theme.snippets.perfectlyAligned};
    margin: ${(props) => props.theme.spacing.medium};
    overflow: auto;
  `,
  Time: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  TimeIcon: styled(AiOutlineClockCircle)`
    margin-right: ${(props) => props.theme.spacing.tiny};
  `,
  Inner: styled(Space)`
    text-align: center;
    font-size: 24px;
    padding: 12px;
  `,
  Card: styled(Card)`
    width: 275px;
    margin-right: ${(props) => props.theme.spacing.small};

    :last-of-type {
      margin-right: ${(props) => props.theme.spacing.huge};
    }
  `,
  Arrow: styled(ImArrowRight2)`
    font-size: 24px;
  `,
  Tag: styled(Tag)`
    ${(props) => props.theme.snippets.fancy};
  `,
  Skeleton: styled(Skeleton)`
    width: 174px;
    height: 133px;
    margin-right: ${(props) => props.theme.spacing.small};
  `,
  Amount: styled.div<{ negative: boolean }>`
    text-align: center;
    color: ${(props) => (props.negative ? "red" : "green")};
    font-size: ${(props) => props.theme.fontSizes.large};
    margin-top: -10px;
  `,
};
