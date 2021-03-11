import { Link } from "react-router-dom";
import { PoolCard, PoolDropdown, ScreenHeader } from "components";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";
import styled, { css } from "styled-components";

interface Props {
  centered?: boolean;
  withBreadcrumb?: boolean;
}

export default function PoolList({
  centered = false,
  withBreadcrumb = true,
}: Props) {
  const pools = useSelector(selectors.selectAllFormattedIndexPools);
  const headerProps = withBreadcrumb
    ? {
        overlay: <PoolDropdown />,
        activeBreadcrumb: <Link to="/pools">Index Pools</Link>,
      }
    : {};

  return (
    <S.PoolList centered={centered}>
      <ScreenHeader title="Pools" {...headerProps} />
      <S.Space>
        {pools.map((pool) => (
          <PoolCard key={pool!.id} pool={pool!} />
        ))}
      </S.Space>
    </S.PoolList>
  );
}

const S = {
  PoolList: styled.div<{ centered?: boolean }>`
    ${(props) =>
      props.centered &&
      css`
        h1 > span {
          width: 100%;
        }
      `}
  `,
  Space: styled.div`
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    justify-content: center;

    .ant-card {
      margin: ${(props) => props.theme.spacing.medium};
    }
  `,
};
