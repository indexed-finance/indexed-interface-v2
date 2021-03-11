import { Carousel } from "antd";
import { Quote } from "components/molecules";
import { useHistory } from "react-router-dom";
import React from "react";
import type { FormattedIndexPool } from "features";

export interface Props {
  pools: FormattedIndexPool[];
}

export default function QuoteCarousel({ pools }: Props) {
  const history = useHistory();

  return (
    <div>
      <Carousel effect="fade" autoplay={true} dots={false}>
        {pools.map((pool) => {
          const filteredPool = pool as FormattedIndexPool;
          const isNegative =
            parseFloat(filteredPool.netChangePercent.replace(/%/g, "")) < 0;

          return (
            <Quote
              key={filteredPool.symbol}
              onClick={() => history.push(`/pools/${filteredPool.slug}`)}
              symbol={filteredPool.symbol}
              price={filteredPool.priceUsd}
              netChange={filteredPool.netChange}
              netChangePercent={filteredPool.netChangePercent}
              isNegative={isNegative}
            />
          );
        })}
      </Carousel>
    </div>
  );
}
