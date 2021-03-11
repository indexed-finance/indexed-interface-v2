import { AiOutlineSwap } from "react-icons/ai";
import { FaTractor } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import { Quote } from "components";
import { Space, Statistic } from "antd";
import { useBreakpoints } from "helpers";
import React, { useMemo } from "react";
import Subscreen, { Action } from "./Subscreen";

export default function Performance({ pool }: { pool: FormattedIndexPool }) {
  const breakpoints = useBreakpoints();
  const performanceActions = useMemo(
    () =>
      [
        {
          type: "primary",
          title: (
            <>
              Stake <FaTractor />
            </>
          ),
          onClick: () => {
            /* */
          },
        },
      ] as Action[],
    []
  );

  return (
    <Subscreen
      icon={<AiOutlineSwap />}
      title="Performance"
      defaultActions={performanceActions}
    >
      <Space direction={breakpoints.sm ? "horizontal" : "vertical"}>
        <Quote
          symbol={pool.symbol}
          price={pool.priceUsd}
          netChange={pool.netChange}
          netChangePercent={pool.netChangePercent}
          isNegative={pool.isNegative}
        />
        <div>
          <Space>
            <Statistic title="Volume" value={pool.volume} />
            <Statistic title="TVL" value={pool.totalValueLocked} />
          </Space>
          <Space>
            <Statistic title="Swap Fee" value={pool.swapFee} />
            <Statistic title="Cumulative Fees" value={pool.cumulativeFee} />
          </Space>
        </div>
      </Space>
    </Subscreen>
  );
}
