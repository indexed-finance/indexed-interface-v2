import { List } from "antd";
import { Token } from "components/atoms";
import React from "react";
import styled from "styled-components";

type Asset = {
  name: string;
  symbol: string;
};

interface Props {
  asset: Asset;
  onClick(asset: Asset): void;
}

const { Item } = List;

export default function SelectableToken({ asset, onClick }: Props) {
  return (
    <S.Item onClick={() => onClick(asset)}>
      <Item.Meta
        avatar={<Token name={asset.symbol} image={asset.symbol} />}
        title={asset.symbol}
        description={asset.name}
      />
    </S.Item>
  );
}

const S = {
  Item: styled(Item)`
    position: relative;
    transition: background 0.3s;

    ::before {
      transition: background 0.33s;
    }

    :hover {
      cursor: pointer;
      background: ${(props) =>
        props.theme.mode === "dark"
          ? props.theme.colors.purple100
          : props.theme.colors.purple300};

      ::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        height: 100%;
        background: ${(props) =>
          props.theme.mode === "dark"
            ? props.theme.colors.purple300
            : props.theme.colors.purple100};
      }
    }
  `,
};
