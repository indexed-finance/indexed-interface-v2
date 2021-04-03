import { AppState, FormattedIndexPool, selectors } from "features";
import { ListCard } from "./ListCard";
import { Quote } from "components/molecules";
import { RankedToken } from "./RankedToken";
import { Space } from "antd";
import { useBreakpoints, usePoolDetailRegistrar } from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

interface Props {
  pool: FormattedIndexPool;
}

export function PoolCard({ pool }: Props) {
  const { assets, category, name, slug } = pool;
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  const categoryLookup = useSelector(selectors.selectCategoryLookup);
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, pool.id)
  );

  usePoolDetailRegistrar(pool.id, tokenIds);

  return (
    <ListCard
      onClick={() => history.push(`/pools/${slug}`)}
      assets={assets}
      title={name}
      subtitle={categoryLookup[category]?.name ?? ""}
      extra={
        <Quote
          price={pool.priceUsd}
          netChange={pool.netChange}
          netChangePercent={pool.netChangePercent}
          isNegative={false}
          centered={false}
          inline={isMobile}
        />
      }
    >
      <Space align="start" className="RankedTokenWrapper">
        {pool.assets.map((token, index) => (
          <RankedToken key={token.symbol} rank={index + 1} token={token} />
        ))}
      </Space>
    </ListCard>
  );
}
