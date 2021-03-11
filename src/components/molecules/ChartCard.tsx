import { AppState, selectors } from "features";
import { Button, Radio } from "components/atoms";
import { Card, Menu, Switch } from "antd";
import { LineSeriesChart } from "components/molecules";
import { SnapshotKey } from "features/dailySnapshots/slice";
import { useSelector } from "react-redux";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

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

  const data = useSelector((state: AppState) => selectors.selectTimeSeriesSnapshotData(state, poolId, timeframe, key));

  return (
    <S.ChartCard
      actions={[
        <Radio.Group value={key} onChange={(e) => setKey(e.target.value as SnapshotKey)}>
          <Radio value={"value"}>Value</Radio>
          <Radio value={"totalSupply"}>Supply</Radio>
          <Radio value={"totalValueLockedUSD"}>Total Value Locked</Radio>
          <Radio value={"totalSwapVolumeUSD"}>Total Swap Volume</Radio>
          <Radio value={"feesTotalUSD"}>Total Swap Fees</Radio>
        </Radio.Group>
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
      <LineSeriesChart data={data} expanded={expanded} />
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
    margin-bottom: ${(props) => props.theme.spacing.medium};
  `,
  Switcher: styled.div`
    ${(props) => props.theme.snippets.perfectlyCentered};
    flex-direction: column;
    text-align: center;
  `,
};

type Timeframe = "Day" | "Week";