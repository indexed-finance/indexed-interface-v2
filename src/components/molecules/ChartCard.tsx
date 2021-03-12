import { AppState, selectors } from "features";
import { Card, Menu, Radio } from "antd";
import { SnapshotKey } from "features";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import LineSeriesChart from "./LineSeriesChart";

type Timeframe = "Day" | "Week";

export interface Props {
  poolId: string;
  expanded?: boolean;
}

export default function ChartCard({ poolId, expanded = false }: Props) {
  const [key, setKey] = useState<SnapshotKey>("value");
  const [timeframe, setTimeframe] = useState<Timeframe>("Day");
  const toggleTimeframe = useCallback(
    () =>
      setTimeframe((prevTimeframe) =>
        prevTimeframe === "Day" ? "Week" : "Day"
      ),
    []
  );

  const data = useSelector((state: AppState) =>
    selectors.selectTimeSeriesSnapshotData(state, poolId, timeframe, key)
  );

  return (
    <Card
      actions={[
        <Radio.Group
          value={key}
          onChange={(e) => setKey(e.target.value as SnapshotKey)}
        >
          <Radio value={"value"}>Value</Radio>
          <Radio value={"totalSupply"}>Supply</Radio>
          <Radio value={"totalValueLockedUSD"}>Total Value Locked</Radio>
          <Radio value={"totalSwapVolumeUSD"}>Total Swap Volume</Radio>
          <Radio value={"feesTotalUSD"}>Total Swap Fees</Radio>
        </Radio.Group>,
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
      <LineSeriesChart data={data} expanded={expanded} />
    </Card>
  );
}
