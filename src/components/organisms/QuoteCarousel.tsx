import { Area } from "components/atoms";
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
    <div style={{ margin: "1rem" }}>
      <Area>
        <S.Carousel effect="fade" autoplay={true} dots={false}>
          {pools.map((pool) => {
            const filteredPool = pool as FormattedIndexPool;
            const isNegative =
              parseFloat(filteredPool.netChangePercent.replace(/%/g, "")) < 0;

            return (
              <S.Quote
                key={filteredPool.symbol}
                onClick={() => history.push(`/pools/${filteredPool.id}`)}
                symbol={filteredPool.symbol}
                price={filteredPool.priceUsd}
                netChange={filteredPool.netChange}
                netChangePercent={filteredPool.netChangePercent}
                isNegative={isNegative}
              />
            );
          })}
        </S.Carousel>
      </Area>
    </div>
  );
}

const S = {
  Carousel: styled(Carousel)`
    padding: ${(props) => props.theme.spacing.small};
    background-size: cover;
    cursor: pointer;
  `,
  Quote: styled(Quote)``,
};
