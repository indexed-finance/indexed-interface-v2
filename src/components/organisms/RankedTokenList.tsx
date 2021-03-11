import { FormattedIndexPool } from "features";
import { List } from "antd";
import { RankedToken } from "components/molecules";
import React from "react";

export interface Props {
  pool: FormattedIndexPool;
}

export default function RankedTokenList({ pool }: Props) {
  return (
    <List size="large" bordered={true}>
      {pool.assets.map((token, index) => (
        <List.Item key={index} data-tokenwrapper={token.symbol}>
          <RankedToken token={token} rank={index + 1} />
        </List.Item>
      ))}
    </List>
  );
}
