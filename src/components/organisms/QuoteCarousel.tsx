import { Carousel } from "antd";
import { Quote } from "components/molecules";
import { useHistory } from "react-router-dom";
import React from "react";
import styled from "styled-components";
import type { FormattedIndexPool } from "features";

export interface Props {
  pools: FormattedIndexPool[];
}

export default function QuoteCarousel({ pools }: Props) {
  const history = useHistory();

  return (
    <S.Carousel effect="fade" autoplay={true} dots={false}>
      {pools.map((pool) => {
        const filteredPool = pool as FormattedIndexPool;

        return (
          <Quote
            key={filteredPool.symbol}
            onClick={() => history.push(`/pools/${filteredPool.id}`)}
            symbol={filteredPool.symbol}
            price={filteredPool.priceUsd}
            netChange={filteredPool.netChange}
            netChangePercent={filteredPool.netChangePercent}
          />
        );
      })}
    </S.Carousel>
  );
}

const S = {
  Carousel: styled(Carousel)`
    padding: ${(props) => props.theme.spacing.medium};
    background-size: cover;
    cursor: pointer;
  `,
};
