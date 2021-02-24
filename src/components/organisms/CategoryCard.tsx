import { Button } from "components/atoms";
import { Card, List } from "antd";
import { FullCategory } from "services";
import { Link } from "react-router-dom";
import React from "react";
import styled from "styled-components";

export interface Props {
  category: FullCategory;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link to={`/categories/${category.symbol.toLowerCase()}`}>
      <S.Card
        key={category.id}
        hoverable={true}
        title={
          <>
            <S.Image
              alt={`${category.symbol} Logo`}
              src={`/images/${category.symbol.toLowerCase()}.png`}
            />
            <S.Name>{category.name}</S.Name>
          </>
        }
        extra={<Button type="primary">More</Button>}
        actions={[
          <S.TokenImageWrapper key="1">
            {category.tokens.map((token) => (
              <S.TokenImage
                alt={token.name}
                title={token.name}
                key={token.id}
                src={`/images/${token.symbol.toLowerCase()}.png`}
              />
            ))}
          </S.TokenImageWrapper>,
        ]}
      >
        <S.Content>
          <S.Meta
            description={
              <>
                {category.brief}
                <S.List header={<S.FirstListItem>Index Pools</S.FirstListItem>}>
                  {category.indexPools.map((indexPool) => (
                    <S.IndexPoolEntry key={indexPool.name}>
                      <span>
                        {indexPool.name} [{indexPool.symbol}]
                      </span>
                      <Button>View</Button>
                    </S.IndexPoolEntry>
                  ))}
                </S.List>
              </>
            }
          />
        </S.Content>
      </S.Card>
    </Link>
  );
}

const S = {
  Name: styled.span`
    font-size: ${(props) => props.theme.fontSizes.huge};
  `,
  Card: styled(Card)`
    flex: 1;
    max-width: 700px;

    .ant-card-head-title {
      ${(props) => props.theme.snippets.fancy};
      font-size: ${(props) => props.theme.fontSizes.large};
    }
    .ant-card-body {
      display: flex;
      align-items: center;
    }
    .ant-card-meta-description {
      font-size: ${(props) => props.theme.fontSizes.large};
      min-height: 194px;
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
  `,
  Image: styled.img`
    flex: 1;
    width: 32px;
    height: 32px;
    margin: ${(props) => props.theme.spacing.medium} 0;
    margin-right: ${(props) => props.theme.spacing.huge};
  `,
  Meta: styled(Card.Meta)`
    flex: 2;
  `,
  TokenImageWrapper: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  `,
  TokenImage: styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
  `,
  List: styled(List)`
    margin-top: ${(props) => props.theme.spacing.medium};
  `,
  FirstListItem: styled.span`
    ${(props) => props.theme.snippets.fancy};
    font-weight: bolder;
  `,
  IndexPoolEntry: styled(List.Item)`
    ${(props) => props.theme.snippets.spacedBetween};
  `,
};
