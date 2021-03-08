import { PoolCard, ScreenHeader } from "components";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import styled from "styled-components";

export default function Pools() {
  const pools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <>
      <ScreenHeader title="Pools" />
      <S.Space wrap={true} size="large" align="start">
        {pools.map((pool) => (
          <PoolCard key={pool!.id} pool={pool!} />
        ))}
      </S.Space>
    </>
  );
}

const S = {
  Space: styled(Space)`
    .ant-space-item {
      flex: 1;
    }
  `,
};
