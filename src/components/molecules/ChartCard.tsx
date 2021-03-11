import { Card, Menu, Switch } from "antd";
import { createChart } from "lightweight-charts";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React, { useCallback, useEffect, useRef, useState } from "react";

export interface Props {
  poolId: string;
  expanded?: boolean;
}

export default function ChartCard({ poolId, expanded = false }: Props) {
  const theme = useSelector(selectors.selectTheme);
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
      const size = expanded
        ? { width: 1200, height: 500 }
        : { width: 400, height: 300 };
      const chart = createChart(cardRef.current, size);
      const options = CHART_MODES[theme];
      const lineSeries = chart.addLineSeries();

      chart.applyOptions(options);

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

      setTimeout(() => {
        if (cardRef.current) {
          chart.resize(
            cardRef.current.clientWidth,
            cardRef.current.clientHeight
          );
        }
      }, 250);
    }
  }, [theme, expanded]);

  return (
    <Card
      actions={[
        <div key="1" onClick={toggleKind}>
          <Switch checked={kind === "Value"} />
          Value
        </div>,
        <div key="2" onClick={toggleKind}>
          <Switch checked={kind === "TotalValueLocked"} />
          Total Value Locked
        </div>,
      ]}
      extra={
        <Menu mode="horizontal" selectedKeys={[timeframe]}>
          {["Day", "Week"].map((_timeframe) => (
            <Menu.Item
              key={_timeframe}
              active={_timeframe === timeframe}
              onClick={toggleTimeframe}
            >
              {_timeframe}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <div ref={cardRef} />
    </Card>
  );
}

type Kind = "Value" | "TotalValueLocked";
type Timeframe = "Day" | "Week";

const COMMON_LAYOUT_OPTIONS = {
  fontFamily: "sans-serif",
  fontSize: 16,
};
const CHART_MODES = {
  dark: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
      backgroundColor: "black",
      textColor: "purple",
    },
    grid: {
      vertLines: {
        color: "purple",
      },
      horzLines: {
        color: "purple",
      },
    },
  },
  light: {
    layout: {
      ...COMMON_LAYOUT_OPTIONS,
      backgroundColor: "white",
      textColor: "black",
    },
    grid: {
      vertLines: {
        color: "purple",
      },
      horzLines: {
        color: "purple",
      },
    },
  },
};
