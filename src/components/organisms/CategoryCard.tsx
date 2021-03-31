import { AppState, selectors } from "features";
import { Link, useHistory } from "react-router-dom";
import { List, Typography } from "antd";
import { ListCard } from "./ListCard";
import { toFormattedAsset } from "ethereum";
import { useSelector } from "react-redux";
import { useTranslation } from "i18n";
import type { Token as TokenType } from "indexed-types";

interface Props {
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

export function CategoryCard({
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
  const tx = useTranslation();
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
        header={
          <Typography.Text type="secondary">
            {tx("INDEX_POOLS")}
          </Typography.Text>
        }
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
