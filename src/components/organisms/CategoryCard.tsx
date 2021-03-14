import { Avatar, Card, List, Typography } from "antd";
import { Link, useHistory } from "react-router-dom";
import { Token } from "components/atoms";
import { useBreakpoints } from "helpers";
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
  const history = useHistory();
  const breakpoints = useBreakpoints();
  const tokenImages = [
    <Avatar.Group
      key="1"
      maxCount={breakpoints.isMobile ? 6 : 20}
      style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
    >
      {Object.values(tokens.entities).map((token) => (
        <Token
          key={token.symbol}
          address={token.id}
          name={token.name}
          image={token.symbol}
          size={breakpoints.isMobile ? "small" : "medium"}
        />
      ))}
    </Avatar.Group>,
  ];

  return (
    <Card
      key={id}
      hoverable={true}
      title={<Typography.Title level={2}>{name}</Typography.Title>}
      actions={tokenImages}
    >
      <div onClick={() => history.push(`/categories/${slug}`)}>
        {brief}
        <List
          header={
            <Typography.Text type="secondary">Index Pools</Typography.Text>
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
      </div>
    </Card>
  );
}
