import { Carousel } from "antd";
import { Link } from "react-router-dom";
import { Quote } from "components/molecules";
import React from "react";
import styled from "styled-components";
import type { FormattedIndexPool } from "features";

export interface Props {
  pools: FormattedIndexPool[];
}

export default function QuoteCarousel({ pools }: Props) {
  return (
    <S.Carousel effect="fade" autoplay={true} dots={false}>
      {pools.map((pool) => {
        const filteredPool = pool as FormattedIndexPool;

        return (
          <Link to={`/pools/${filteredPool.id}`} key={filteredPool.id}>
            <S.Quote
              symbol={filteredPool.symbol}
              price={filteredPool.priceUsd}
              netChange={filteredPool.netChange}
              netChangePercent={filteredPool.netChangePercent}
            />
          </Link>
        );
      })}
    </S.Carousel>
  );
}

const S = {
  Carousel: styled(Carousel)`
    background: white;
    padding: ${(props) => props.theme.spacing.medium};
    height: 160px;
    background: url("/chart.png");
    background-size: cover;
  `,
  Quote: styled(Quote)`
    background: rgba(255, 255, 255, 0.5);
  `,
};
