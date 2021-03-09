import { Badge, Card, List, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { useHistory } from "react-router-dom";
import RankedTokenList from "./RankedTokenList";
import React from "react";
import styled from "styled-components";

const PLACEHOLDER_IMAGE = "https://placehold.it/32x32";

export interface Props {
  pool: FormattedIndexPool;
}

export default function PoolCard({ pool }: Props) {
  const { assets, name, id } = pool;
  const history = useHistory();

  return (
    <S.Card
      onClick={() => history.push(`/pools/${id}`)}
      key={id}
      hoverable={true}
      size="small"
      title={
        <>
          <S.Category type="secondary">{pool.category}</S.Category> <br />
          {name}
        </>
      }
      actions={[
        <S.TokenImageWrapper key="1">
          {assets.map((token, index) => {
            let assetImage = PLACEHOLDER_IMAGE;

            try {
              assetImage = require(`assets/images/${token.symbol.toLowerCase()}.png`)
                .default;
            } catch {}

            return (
              <S.TokenImage
                alt={token.name}
                title={token.name}
                key={index}
                src={assetImage}
              />
            );
          })}
        </S.TokenImageWrapper>,
      ]}
    >
      <S.Content>
        <RankedTokenList pool={pool} />
      </S.Content>
    </S.Card>
  );
}

const S = {
  Name: styled.span`
    font-size: ${(props) => props.theme.fontSizes.huge};
  `,
  Card: styled(Card)`
    flex: 1;

    .ant-card-head-title {
      ${(props) => props.theme.snippets.fancy};
      font-size: ${(props) => props.theme.fontSizes.medium};
    }
    .ant-card-body {
      display: flex;
      min-width: 370px;
      height: 390px;
      overflow: auto;
    }
  `,
  Title: styled.h1`
    align-items: center;
    text-align: right;
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Content: styled.div`
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    flex-wrap: wrap;
    overflow: auto;
    flex: 1;
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
  Badge: styled(Badge.Ribbon)`
    font-size: ${(props) => props.theme.fontSizes.large};
    ${(props) => props.theme.snippets.fancy};
  `,
  Category: styled(Typography.Text)`
    font-size: ${(props) => props.theme.fontSizes.tiny};
  `,
};
