import { Button } from "components/atoms";
import { Card, Menu } from "antd";
import { CgArrowsExpandRight } from "react-icons/cg";
import React from "react";
import styled from "styled-components";

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface Props {
  timeframe: Timeframe;
}

export default function ChartCard({ timeframe }: Props) {
  return (
    <S.ChartCard
      cover={<img src={`/images/chart.png`} alt="Chart" />}
      extra={
        <S.Menu mode="horizontal" selectedKeys={[timeframe]}>
          {["1D", "1W", "1M", "3M", "1Y"].map((_timeframe) => (
            <S.MenuItem key={_timeframe}>{_timeframe}</S.MenuItem>
          ))}
        </S.Menu>
      }
    >
      <S.Button type="default" title="Expand chart">
        <CgArrowsExpandRight />
      </S.Button>
    </S.ChartCard>
  );
}

const S = {
  ChartCard: styled(Card)`
    position: relative;

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
};
