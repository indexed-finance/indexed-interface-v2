import { AppState, Timeframe, requests, selectors } from "features";
import { Card, Radio, RadioChangeEvent, Spin } from "antd";
import { LineSeriesChart, Quote } from "components/atomic/molecules";
import { convert } from "helpers";
import { last } from "hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import noop from "lodash.noop";

interface Props {
  poolId: string;
  expanded?: boolean;
}

export function IndexPoolChart({ poolId, expanded = false }: Props) {
  const dispatch = useDispatch();
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const [rerendering, setRerendering] = useState(false);
  const data = useSelector((state: AppState) =>
    selectors.selectTimeSeriesSnapshotData(state, poolId, timeframe, "value")
  );
  const [historicalData, setHistoricalData] = useState<null | {
    when: string;
    price: string;
  }>(null);
  const [netChange, netChangePercent] = useMemo(() => {
    const firstValue = data[0].value;
    const currentValue = last(data).value;
    const delta = currentValue - firstValue;
    return [
      convert.toCurrency(delta, { signDisplay: "always" }),
      convert.toPercent(delta / firstValue, { signDisplay: "always" }),
    ];
  }, [data]);
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

    dispatch(requests.fetchSnapshotsData({ poolId, timeframe }));
  }, [dispatch, poolId, timeframe]);

  return (
    <Card style={{ height: "100%" }}>
      {formattedPool ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 1 }}>
              <Quote
                address={formattedPool.id}
                symbol={formattedPool.symbol}
                name={formattedPool.name}
                price={
                  historicalData ? historicalData.price : formattedPool.priceUsd
                }
                netChange={historicalData ? historicalData.when : netChange}
                netChangePercent={historicalData ? "" : netChangePercent}
                inline={true}
                textSize="large"
                style={{
                  marginRight: 8,
                  marginBottom: 0,
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <Radio.Group
                onChange={handleTimeframeChange}
                value={timeframe}
                size="large"
              >
                {["1D", "1W", "2W", "1M", "3M", "6M", "1Y"].map((timeframe) => (
                  <Radio.Button key={timeframe} value={timeframe}>
                    {timeframe}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>
          </div>
          <div
            style={{ height: 260, overflow: "auto" }}
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
    </Card>
  );
}
