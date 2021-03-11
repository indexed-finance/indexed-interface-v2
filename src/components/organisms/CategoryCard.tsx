import { Card, List } from "antd";
import { Link, useHistory } from "react-router-dom";
import { Token } from "components/atoms";
import React from "react";
import styled from "styled-components";
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
    <S.Card
      key={id}
      hoverable={true}
      title={name}
      actions={[
        <S.TokenImageWrapper key="1">
          {Object.values(tokens.entities).map((token) => (
            <Token
              key={token.symbol}
              address={token.id}
              name={token.name}
              image={token.symbol}
            />
          ))}
        </S.TokenImageWrapper>,
      ]}
    >
      <S.Content>
        <div onClick={() => history.push(`/categories/${slug}`)}>
          <S.Meta
            description={
              <>
                {brief}
                <S.List header={<S.FirstListItem>Index Pools</S.FirstListItem>}>
                  {indexPools.map((indexPool) => (
                    <S.IndexPoolEntry key={indexPool.name}>
                      <Link to={`/pools/${indexPool.slug}`}>
                        {indexPool.name} [{indexPool.symbol}]
                      </Link>
                    </S.IndexPoolEntry>
                  ))}
                </S.List>
              </>
            }
          />
        </div>
      </S.Content>
    </S.Card>
  );
}

const S = {
  Name: styled.span`
    font-size: ${(props) => props.theme.fontSizes.huge};
  `,
  Card: styled(Card)`
    width: ${(props) => (props.theme.isMobile ? "330px" : "375px")};

    .ant-card-head-title {
      ${(props) => props.theme.snippets.fancy};
      font-size: ${(props) => props.theme.fontSizes.large};
    }
    .ant-card-body {
      display: flex;
      align-items: center;
      height: 300px;
    }
    .ant-card-meta-description {
      font-size: ${(props) => props.theme.fontSizes.large};
    }
  `,
  Title: styled.h1`
    align-items: center;
    text-align: right;
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Content: styled.div`
    display: flex;
    align-items: flex-start;
    flex: 1;
  `,
  Token: styled(Token)`
    flex: 1;
    margin: ${(props) => props.theme.spacing.medium} 0;
    margin-right: ${(props) => props.theme.spacing.huge};
  `,
  Meta: styled(Card.Meta)`
    flex: 2;
  `,
  TokenImageWrapper: styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  `,
  List: styled(List)`
    margin-top: ${(props) => props.theme.spacing.medium};
  `,
  FirstListItem: styled.span`
    ${(props) => props.theme.snippets.fancy};
    font-weight: bolder;
  `,
  IndexPoolEntry: styled(List.Item)`
    ${(props) => props.theme.snippets.perfectlyCentered};
  `,
  CardTitle: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
};
