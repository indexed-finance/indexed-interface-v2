import { AppState, SnapshotKey, selectors } from "features";
import { Card, Menu, Space, Typography } from "antd";
import { LineSeriesChart } from "./LineSeriesChart";
import { Quote } from "./Quote";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";
import SkeletonImage from "antd/lib/skeleton/Image";

type Timeframe = "Day" | "Week";

interface Props {
  poolId: string;
  expanded?: boolean;
}

export function ChartCard({ poolId, expanded = false }: Props) {
  const tx = useTranslator();
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
  const [rerendering, setRerendering] = useState(false);
  const handleRerenderChart = useCallback(() => {
    setRerendering(true);
    setTimeout(() => setRerendering(false), 0);
  }, []);
  const optionLookup: Partial<Record<SnapshotKey, string>> = {
    value: tx("VALUE_IN_USD"),
    totalValueLockedUSD: tx("SUPPLY_IN_TOKENS"),
    totalSupply: tx("TOTAL_VALUE_LOCKED_IN_USD"),
    totalSwapVolumeUSD: tx("TOTAL_SWAP_VOLUME_IN_USD"),
    feesTotalUSD: tx("TOTAL_SWAP_FEES_IN_USD"),
  };

  return (
    <Card
      title={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          {formattedPool && (
            <>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {formattedPool.name}
              </Typography.Title>
              <Quote
                price={formattedPool.priceUsd}
                netChange={formattedPool.netChange}
                netChangePercent={formattedPool.netChangePercent}
                isNegative={formattedPool.isNegative}
                inline={true}
              />
            </>
          )}
        </Space>
      }
      headStyle={{
        paddingLeft: 10,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Card.Grid
        style={{ width: "30%", padding: 1, borderBottom: "none" }}
        hoverable={false}
      >
        <Menu
          theme="dark"
          openKeys={["timeframe", "criteria"]}
          selectedKeys={[timeframe, key]}
          multiple={true}
          mode="inline"
          inlineIndent={12}
          expandIcon={() => null}
        >
          <Menu.SubMenu key="timeframe" title={tx("TIMEFRAME")}>
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
          </Menu.SubMenu>
          <Menu.SubMenu key="criteria" title={tx("CRITERIA")}>
            {Object.entries(optionLookup).map(([optionKey, optionValue]) => (
              <Menu.Item
                key={optionKey}
                onClick={() => setKey(optionKey as SnapshotKey)}
              >
                {optionValue}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        </Menu>
      </Card.Grid>
      <Card.Grid style={{ width: "70%", padding: 1 }} hoverable={false}>
        {rerendering ? (
          <SkeletonImage />
        ) : (
          <LineSeriesChart
            data={data}
            expanded={expanded}
            settings={settings}
            onChangeTheme={handleRerenderChart}
          />
        )}
      </Card.Grid>
    </Card>
  );
}
