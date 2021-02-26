import { FormattedIndexPool } from "features";
import { List } from "antd";
import React from "react";
import styled from "styled-components";

type Asset = FormattedIndexPool["assets"][0];

interface Props {
  asset: Asset;
  onClick(asset: Asset): void;
}

const { Item } = List;

export default function SelectableToken({ asset, onClick }: Props) {
  return (
    <Item onClick={() => onClick(asset)}>
      <Item.Meta
        avatar={
          <S.Avatar
            alt={asset.symbol}
            src={
              require(`assets/images/${asset.symbol.toLowerCase()}.png`).default
            }
          />
        }
        title={asset.symbol}
        description={asset.name}
      />
    </Item>
  );
}

const S = {
  Avatar: styled.img`
    ${(props) => props.theme.snippets.circular};
    ${(props) => props.theme.snippets.size32};
  `,
};
