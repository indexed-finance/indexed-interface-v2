import { FormattedIndexPool } from "features";
import { List } from "antd";
import { RankedToken } from "components/molecules";
import React from "react";
import styled from "styled-components";

export interface Props {
  pool: FormattedIndexPool;
}

export default function RankedTokenList({ pool }: Props) {
  return (
    <S.List size="large" bordered={true}>
      {pool.assets.map((token, index) => (
        <S.RankedTokenWrapper
          key={token.symbol}
          data-tokenwrapper={token.symbol}
        >
          <RankedToken token={token} rank={index + 1} />
        </S.RankedTokenWrapper>
      ))}
    </S.List>
  );
}

const S = {
  List: styled(List)`
    width: 100%;
    background: white;
  `,
  RankedTokenWrapper: styled(List.Item)`
    position: relative;
    overflow: hidden;
    padding: ${(props) => props.theme.spacing.small} !important;
  `,
};
