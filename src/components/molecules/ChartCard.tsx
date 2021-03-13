import { AppState, selectors } from "features";
import { Card, Divider, Menu, Radio, RadioChangeEvent } from "antd";
import { SnapshotKey } from "features";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import LineSeriesChart from "./LineSeriesChart";
import Quote from "./Quote";

type Timeframe = "Day" | "Week";

export interface Props {
  poolId: string;
  expanded?: boolean;
}

export default function ChartCard({ poolId, expanded = false }: Props) {
  const [key, setKey] = useState<SnapshotKey>("value");
  const [timeframe, setTimeframe] = useState<Timeframe>("Day");
  const poolName = useSelector((state: AppState) =>
    selectors.selectNameForPool(state, poolId)
  );
  const data = useSelector((state: AppState) =>
    selectors.selectTimeSeriesSnapshotData(state, poolId, timeframe, key)
  );
  const formattedPool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolName)
  );
  const toggleTimeframe = useCallback(
    () =>
      setTimeframe((prevTimeframe) =>
        prevTimeframe === "Day" ? "Week" : "Day"
      ),
    []
  );
  const handleRadioGroupChange = useCallback(
    (event: RadioChangeEvent) => setKey(event.target.value as SnapshotKey),
    []
  );

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
      actions={[
        <Radio.Group
          key="1"
          value={key}
          onChange={handleRadioGroupChange}
          style={{ width: "100%" }}
        >
          <div className="spaced-evenly">
            <Radio.Button value={"value"} style={{ width: 125 }}>
              Value
            </Radio.Button>
            <Radio.Button value={"totalSupply"} style={{ width: 125 }}>
              Supply
            </Radio.Button>
          </div>
          <Divider style={{ marginTop: 10, marginBottom: 10 }} />
          <div className="spaced-evenly">
            <Radio.Button value={"totalValueLockedUSD"}>
              Total Value Locked
            </Radio.Button>
            <Radio.Button value={"totalSwapVolumeUSD"}>
              Total Swap Volume
            </Radio.Button>
            <Radio.Button value={"feesTotalUSD"}>Total Swap Fees</Radio.Button>
          </div>
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
