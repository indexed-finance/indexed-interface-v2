import { AppState, selectors } from "features";
import { FormattedIndexPool } from "features";
import { Quote } from "components/molecules";
import { Space } from "antd";
import { useBreakpoints } from "helpers";
import { useHistory } from "react-router-dom";
import { usePoolDataListener } from "features/batcher/hooks";
import { useSelector } from "react-redux";
import ListCard from "./ListCard";
import RankedToken from "./RankedToken";

export interface Props {
  pool: FormattedIndexPool;
}

export default function PoolCard({ pool }: Props) {
  const { assets, category, name, slug } = pool;
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, pool.id)
  );

  usePoolDataListener(pool.id, tokenIds);

  return (
    <ListCard
      onClick={() => history.push(`/pools/${slug}`)}
      assets={assets}
      title={name}
      subtitle={category}
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
