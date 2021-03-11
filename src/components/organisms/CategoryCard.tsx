import { Card, List } from "antd";
import { Link, useHistory } from "react-router-dom";
import { Token } from "components/atoms";
import React from "react";
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

  return (
    <Card
      key={id}
      hoverable={true}
      title={name}
      actions={[
        <div key="1">
          {Object.values(tokens.entities).map((token) => (
            <Token
              key={token.symbol}
              address={token.id}
              name={token.name}
              image={token.symbol}
            />
          ))}
        </div>,
      ]}
    >
      <div>
        <div onClick={() => history.push(`/categories/${slug}`)}>
          <Card.Meta
            description={
              <>
                {brief}
                <List header="Index Pools">
                  {indexPools.map((indexPool) => (
                    <List.Item key={indexPool.name}>
                      <Link to={`/pools/${indexPool.slug}`}>
                        {indexPool.name} [{indexPool.symbol}]
                      </Link>
                    </List.Item>
                  ))}
                </List>
              </>
            }
          />
        </div>
      </div>
    </Card>
  );
}
