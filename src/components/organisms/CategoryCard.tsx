import { AppState, selectors } from "features";
import { Link, useHistory } from "react-router-dom";
import { List, Typography } from "antd";
import { toFormattedAsset } from "ethereum";
import { useSelector } from "react-redux";
import ListCard from "./ListCard";
import type { Token as TokenType } from "indexed-types";

export interface Props {
  id?: string;
  symbol?: string;
  name?: string;
  slug?: string;
  brief?: string;
  indexPools?: Array<{
    id: string;
    name: string;
    slug: string;
    symbol: string;
  }>;
  tokens?: {
    ids: string[];
    entities: Record<string, TokenType>;
  };
}

export default function CategoryCard({
  id = "",
  symbol = "",
  name = "",
  slug = "",
  brief = "",
  indexPools = [],
  tokens = {
    ids: [],
    entities: {},
  },
}: Props) {
  const category = useSelector((state: AppState) =>
    selectors.selectCategory(state, id)
  );
  const tokenLookup = useSelector(selectors.selectTokenLookup);
  const history = useHistory();

  return (
    <ListCard
      onClick={() => history.push(`/categories/${slug}`)}
      assets={
        category
          ? tokens.ids
              .map((id) => tokenLookup[id])
              .filter(Boolean)
              .map((token) => toFormattedAsset(token!))
          : []
      }
      title={name}
      subtitle={symbol}
    >
      {brief}
      <List
        header={<Typography.Text type="secondary">Index Pools</Typography.Text>}
      >
        {indexPools.map((indexPool) => (
          <List.Item key={indexPool.name}>
            <Link to={`/pools/${indexPool.slug}`}>
              {indexPool.name} [{indexPool.symbol}]
            </Link>
          </List.Item>
        ))}
      </List>
    </ListCard>
  );
}
