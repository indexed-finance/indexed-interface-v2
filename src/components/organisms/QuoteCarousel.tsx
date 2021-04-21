import { Carousel } from "antd";
import { FormattedIndexPool, selectors } from "features";
import { Quote } from "components/molecules";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

interface Props {
  pools: FormattedIndexPool[];
}

export function QuoteCarousel({ pools }: Props) {
  const history = useHistory();
  const theme = useSelector(selectors.selectTheme);

  return (
    <Carousel
      effect="fade"
      autoplay={true}
      dots={false}
      className={`Carousel ${theme === "outrun" && "BuildingQuote"}`}
    >
      {pools.map((pool) => {
        const filteredPool = pool as FormattedIndexPool;

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
            />
          </div>
        );
      })}
    </Carousel>
  );
}
