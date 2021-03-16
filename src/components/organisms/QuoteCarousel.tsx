import { Carousel } from "antd";
import { Quote } from "components/molecules";
import { useHistory } from "react-router-dom";

import type { FormattedIndexPool } from "features";

export interface Props {
  pools: FormattedIndexPool[];
}

export default function QuoteCarousel({ pools }: Props) {
  const history = useHistory();

  return (
    <Carousel effect="fade" autoplay={true} dots={false} className="Carousel">
      {pools.map((pool) => {
        const filteredPool = pool as FormattedIndexPool;
        const isNegative =
          parseFloat(filteredPool.netChangePercent.replace(/%/g, "")) < 0;

        return (
          <div
            key={filteredPool.symbol}
            style={{ cursor: "pointer" }}
            onClick={() => history.push(`/pools/${filteredPool.slug}`)}
          >
            <Quote
              symbol={filteredPool.symbol}
              price={filteredPool.priceUsd}
              netChange={filteredPool.netChange}
              netChangePercent={filteredPool.netChangePercent}
              isNegative={isNegative}
            />
          </div>
        );
      })}
    </Carousel>
  );
}
