import { AiOutlineSwap } from "react-icons/ai";
import { Button, Quote } from "components";
import { FaTractor } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import { Grid, Space, Statistic } from "antd";
import React from "react";
import Subscreen from "./Subscreen";
import styled from "styled-components";

const { useBreakpoint } = Grid;

export default function Performance({ pool }: { pool: FormattedIndexPool }) {
  const breakpoints = useBreakpoint();
  const stakingButton = (
    <S.Stake key="stake" type="primary">
      <S.Tractor /> Stake this pool
    </S.Stake>
  );

  return (
    <Subscreen icon={<AiOutlineSwap />} title="Performance">
      <S.PerformanceSpace
        direction={breakpoints.sm ? "horizontal" : "vertical"}
      >
        <Quote
          symbol={pool.symbol}
          price={pool.priceUsd}
          netChange={pool.netChange}
          netChangePercent={pool.netChangePercent}
          isNegative={pool.isNegative}
        />
        <div>
          <Space>
            <S.Statistic title="Volume" value={pool.volume} />
            <S.Statistic title="TVL" value={pool.totalValueLocked} />
          </Space>
          <Space>
            <S.Statistic title="Swap Fee" value={pool.swapFee} />
            <S.Statistic title="Cumulative Fees" value={pool.cumulativeFee} />
          </Space>
          {breakpoints.sm && stakingButton}
        </div>
      </S.PerformanceSpace>
    </Subscreen>
  );
}

const S = {
  PerformanceSpace: styled(Space)`
    width: 100%;

    .ant-space-vertical {
      width: 100%;
    }
  `,
  Stake: styled(Button)`
    ${(props) => props.theme.snippets.perfectlyCentered};
    width: 100%;
    text-align: center;
  `,
  Statistic: styled(Statistic)`
    margin-bottom: ${(props) => props.theme.spacing.small};

    .ant-statistic-title {
      font-size: 11px;
      font-weight: bolder;
    }

    .ant-statistic-content {
      font-size: 14px;
    }
  `,
  Tractor: styled(FaTractor)`
    margin-right: ${(props) => props.theme.spacing.small};
  `,
};
