import { Button } from "components/atoms";
import { Card, Menu, Switch } from "antd";
import { NormalizedPool } from "ethereum";
import { colors } from "theme";
import { createChart } from "lightweight-charts";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

type Kind = "Value" | "TotalValueLocked";
type Timeframe = "Day" | "Week";

export interface Props {
  pool: NormalizedPool;
}

export default function ChartCard({ pool }: Props) {
  const [kind, setKind] = useState<Kind>("Value");
  const [timeframe, setTimeframe] = useState<Timeframe>("Day");
  const toggleKind = useCallback(
    () =>
      setKind((prevKind) =>
        prevKind === "Value" ? "TotalValueLocked" : "Value"
      ),
    []
  );
  const toggleTimeframe = useCallback(
    () =>
      setTimeframe((prevTimeframe) =>
        prevTimeframe === "Day" ? "Week" : "Day"
      ),
    []
  );
  const cardRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      const chart = createChart(cardRef.current, { width: 400, height: 300 });

      (window as any).ccc = chart;

      chart.applyOptions({
        layout: {
          backgroundColor: colors.black400,
          fontFamily: "sans-serif",
          textColor: colors.purple200,
          fontSize: 16,
        },
        grid: {
          vertLines: {
            color: colors.purple100,
            style: 1,
            visible: true,
          },
          horzLines: {
            color: colors.purple100,
            style: 1,
            visible: true,
          },
        },
      });

      const lineSeries = chart.addLineSeries();

      lineSeries.setData([
        { time: "2019-04-11", value: 80.01 },
        { time: "2019-04-12", value: 96.63 },
        { time: "2019-04-13", value: 76.64 },
        { time: "2019-04-14", value: 81.89 },
        { time: "2019-04-15", value: 74.43 },
        { time: "2019-04-16", value: 80.01 },
        { time: "2019-04-17", value: 96.63 },
        { time: "2019-04-18", value: 76.64 },
        { time: "2019-04-19", value: 81.89 },
        { time: "2019-04-20", value: 74.43 },
      ]);
    }
  }, []);

  return (
    <S.ChartCard
      actions={[
        <>
          <S.Switch key="1" checked={kind === "Value"} onClick={toggleKind} />
          Value
        </>,
        <>
          <S.Switch
            key="2"
            checked={kind === "TotalValueLocked"}
            onClick={toggleKind}
          />
          Total Value Locked
        </>,
      ]}
      extra={
        <S.Menu mode="horizontal" selectedKeys={[timeframe]}>
          {["Day", "Week"].map((_timeframe) => (
            <S.MenuItem
              key={_timeframe}
              active={_timeframe === timeframe}
              onClick={toggleTimeframe}
            >
              {_timeframe}
            </S.MenuItem>
          ))}
        </S.Menu>
      }
    >
      <div ref={cardRef} />
    </S.ChartCard>
  );
}

const S = {
  ChartCard: styled(Card)`
    position: relative;
    margin-bottom: ${(props) => props.theme.spacing.medium};

    .ant-card-extra {
      width: 100%;
    }
  `,
  Button: styled(Button)`
    position: absolute;
    right: ${(props) => props.theme.spacing.small};
    bottom: ${(props) => props.theme.spacing.small};
    ${(props) => props.theme.snippets.perfectlyCentered};
  `,
  Menu: styled(Menu)`
    display: flex;
  `,
  MenuItem: styled(Menu.Item)`
    flex: 1;
    text-align: center;
  `,
  Switch: styled(Switch)`
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
};
