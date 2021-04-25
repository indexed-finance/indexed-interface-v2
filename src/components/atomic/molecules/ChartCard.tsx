import { AppState, selectors } from "features";
import { LineSeriesChart } from "./LineSeriesChart";
import { Quote } from "./Quote";
import { Radio, RadioChangeEvent, Space, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import noop from "lodash.noop";

type Timeframe = "Day" | "Week";

interface Props {
  poolId: string;
  expanded?: boolean;
}

export function ChartCard({ poolId, expanded = false }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>("Week");
  const [rerendering, setRerendering] = useState(false);
  const data = useSelector((state: AppState) =>
    selectors.selectTimeSeriesSnapshotData(state, poolId, timeframe, "value")
  );
  const [historicalData, setHistoricalData] = useState<null | {
    when: string;
    price: string;
  }>(null);
  const formattedPool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolId)
  );
  const handleTimeframeChange = useCallback(
    (event: RadioChangeEvent) => setTimeframe(event.target.value),
    []
  );

  useEffect(() => {
    setRerendering(true);
    setTimeout(() => setRerendering(false), 0);
  }, [timeframe]);

  return (
    <div>
      {formattedPool ? (
        <>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Quote
              symbol={formattedPool.symbol}
              name={formattedPool.name}
              price={
                historicalData ? historicalData.price : formattedPool.priceUsd
              }
              netChange={
                historicalData ? historicalData.when : formattedPool.netChange
              }
              netChangePercent={
                historicalData ? "" : formattedPool.netChangePercent
              }
            />
            <Radio.Group
              onChange={handleTimeframeChange}
              value={timeframe}
              size="large"
            >
              <Radio.Button value="Day">Day</Radio.Button>
              <Radio.Button value="Week">Week</Radio.Button>
            </Radio.Group>
          </Space>
          <div
            style={{ height: 260 }}
            onMouseOut={() => setHistoricalData(null)}
          >
            {!rerendering && (
              <LineSeriesChart
                data={data}
                expanded={expanded}
                onChangeTheme={noop}
                onMoveCrosshair={setHistoricalData}
              />
            )}
          </div>
        </>
      ) : (
        <Spin />
      )}
    </div>
  );
}
