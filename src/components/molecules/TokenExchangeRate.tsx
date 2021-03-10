import { Alert, Statistic, Typography } from "antd";
import { convert } from "helpers";
import React from "react";
import styled from "styled-components";

export interface Props {
  baseline: string;
  comparison: string;
  rate: string | number;
  fee: string;
}

export default function TokenExchangeRate({
  baseline,
  comparison,
  fee,
  rate,
}: Props) {
  return (
    <S.Wrapper
      message={
        <S.Title level={4}>
          <Statistic
            title="Exchange Rate"
            value={`1 ${baseline} ≈ ${convert.toComma(
              typeof rate === "number" ? rate : parseFloat(rate)
            )} ${comparison}`}
          />
          <Statistic title="Fee" value={fee} />
        </S.Title>
      }
    />
  );
}

const S = {
  Wrapper: styled(Alert)`
    position: relative;
    width: 100%;
  `,
  Title: styled(Typography.Title)`
    ${(props) => props.theme.snippets.spacedBetween};
    flex-wrap: wrap;
    margin-bottom: 0 !important;
  `,
};
