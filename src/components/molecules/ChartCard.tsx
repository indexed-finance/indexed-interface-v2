import { AppState, selectors } from "features";
import { Card, Menu, Select, Space, Typography } from "antd";
import { LineSeriesChart } from "./LineSeriesChart";
import { Quote } from "./Quote";
import { useBreakpoints, useTranslator } from "hooks";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { SnapshotKey } from "features/dailySnapshots/slice";

type Timeframe = "Day" | "Week";

interface Props {
  poolId: string;
  expanded?: boolean;
}

export function ChartCard({ poolId, expanded = false }: Props) {
  const tx = useTranslator();
  const theme = useSelector(selectors.selectTheme);
  const [timeframe, setTimeframe] = useState<Timeframe>("Day");
  const [key, setKey] = useState<SnapshotKey>("value");
  const settings = useMemo<[Timeframe, SnapshotKey]>(() => [timeframe, key], [
    timeframe,
    key,
  ]);
  const data = useSelector((state: AppState) =>
    selectors.selectTimeSeriesSnapshotData(state, poolId, timeframe, key)
  );
  const formattedPool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolId)
  );
  const toggleTimeframe = useCallback(
    () =>
      setTimeframe((prevTimeframe) =>
        prevTimeframe === "Day" ? "Week" : "Day"
      ),
    []
  );
  const { isMobile } = useBreakpoints();
  const [rerendering, setRerendering] = useState(false);
  const handleRerenderChart = useCallback(() => {
    setRerendering(true);
    setTimeout(() => setRerendering(false), 0);
  }, []);
  const timeframeAction = (
    <>
      <Typography.Paragraph
        type="secondary"
        style={{
          textAlign: "center",
          paddingLeft: isMobile ? 0 : 20,
          marginBottom: isMobile ? -10 : 0,
        }}
      >
        {tx("TIMEFRAME")}
      </Typography.Paragraph>
      <Menu
        style={{ textAlign: "center", marginTop: 0 }}
        mode="horizontal"
        selectedKeys={[timeframe]}
      >
        <Menu.Item
          key="Day"
          active={timeframe === "Day"}
          onClick={toggleTimeframe}
        >
          {tx("DAY")}
        </Menu.Item>
        <Menu.Item
          key="Week"
          active={timeframe === "Week"}
          onClick={toggleTimeframe}
        >
          {tx("WEEK")}
        </Menu.Item>
      </Menu>
    </>
  );
  const criteriaAction = (
    <>
      <Typography.Paragraph
        type="secondary"
        style={{
          textAlign: "center",
          paddingRight: isMobile ? 0 : 30,
          marginBottom: isMobile ? 0 : 15,
        }}
      >
        {tx("CRITERIA")}
      </Typography.Paragraph>
      <Select
        value={key}
        style={{ width: isMobile ? "240px" : "80%" }}
        onChange={setKey}
      >
        <Select.Option value="value">{tx("VALUE_IN_USD")}</Select.Option>
        <Select.Option value="totalSupply">
          {tx("SUPPLY_IN_TOKENS")}
        </Select.Option>
        <Select.Option value="totalValueLockedUSD">
          {tx("TOTAL_VALUE_LOCKED_IN_USD")}
        </Select.Option>
        <Select.Option value="totalSwapVolumeUSD">
          {tx("TOTAL_SWAP_VOLUME_IN_USD")}
        </Select.Option>
        <Select.Option value="feesTotalUSD">
          {tx("TOTAL_SWAP_FEES_IN_USD")}
        </Select.Option>
      </Select>
    </>
  );
  const actions = isMobile
    ? [
        <Space direction="vertical" key="1">
          {timeframeAction}
          {criteriaAction}
        </Space>,
      ]
    : [
        <div key="1">{timeframeAction}</div>,
        <div key="2">{criteriaAction}</div>,
      ];

  return (
    <Card
      title={
        formattedPool && (
          <Quote
            symbol={formattedPool.symbol}
            price={formattedPool.priceUsd}
            netChange={formattedPool.netChange}
            netChangePercent={formattedPool.netChangePercent}
            isNegative={formattedPool.isNegative}
            inline={true}
          />
        )
      }
      headStyle={{
        background: ["dark", "outrun"].includes(theme) ? "#0a0a0a" : "#fff",
        paddingLeft: 10,
      }}
      bodyStyle={{ padding: 0, height: 300 }}
      actions={actions}
    >
      {!rerendering && (
        <LineSeriesChart
          data={data}
          expanded={expanded}
          settings={settings}
          onChangeTheme={handleRerenderChart}
        />
      )}
    </Card>
  );
}
