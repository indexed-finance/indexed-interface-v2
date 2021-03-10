import { Button } from "components/atoms";
import { Card, Menu, Switch } from "antd";
import { NormalizedPool } from "ethereum";
import React, { useCallback, useState } from "react";
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

  return (
    <S.ChartCard
      cover={
        <img src={require("assets/images/chart.png").default} alt="Chart" />
      }
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
    ></S.ChartCard>
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
