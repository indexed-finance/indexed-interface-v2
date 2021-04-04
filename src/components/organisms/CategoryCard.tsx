import {
  AppState,
  FormattedCategoryToken,
  NormalizedToken,
  formatPoolAsset,
  selectors,
} from "features";
import { Link, useHistory } from "react-router-dom";
import { List, Typography } from "antd";
import { ListCard } from "./ListCard";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";

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
  tokens?: FormattedCategoryToken[];
}

export function CategoryCard({
  id = "",
  symbol = "",
  name = "",
  slug = "",
  brief = "",
  indexPools = [],
  tokens = [],
}: Props) {
  const tx = useTranslator();
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
          ? category.tokens.ids
              .map((id) => tokenLookup[id])
              .filter((each): each is NormalizedToken => Boolean(each))
              .map((token) => formatPoolAsset(token))
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
