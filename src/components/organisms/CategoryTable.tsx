import { Button } from "components/atoms";
import { DEFAULT_DECIMAL_COUNT } from "config";
import { FullCategory } from "services";
import { Table } from "antd";
import { convert } from "helpers";
import {
  formatBalance,
  toBN,
  toTokenAmount,
} from "@indexed-finance/indexed.js";
import React from "react";
import styled from "styled-components";

interface Props {
  category: FullCategory;
}

export default function CategoryTable(props: Props) {
  const dataSource = props.category.indexPools.map((indexPool) => {
    const value = parseFloat(
      toTokenAmount(
        toBN(indexPool.totals.valueLockedUsd).dividedBy(
          toBN(indexPool.totals.supply)
        ),
        18
      ).toString()
    );

    return {
      symbol: indexPool.symbol,
      size: indexPool.size,
      price: convert.toCurrency(value),
      supply: convert.toComma(
        parseFloat(
          formatBalance(toBN(indexPool.totals.supply), DEFAULT_DECIMAL_COUNT, 2)
        )
      ),
      marketCap: convert.toCurrency(
        parseFloat(indexPool.totals.valueLockedUsd)
      ),
      swapFee: `${formatBalance(
        toBN(indexPool.fees.swap).times(100),
        DEFAULT_DECIMAL_COUNT,
        4
      )}%`,
      cumulativeFees: convert.toCurrency(parseFloat(indexPool.fees.totalUsd)),
      volume: convert.toCurrency(parseFloat(indexPool.totals.volumeUsd)),
      action: (
        <Button type="primary" href={`/index-pool?pool=${indexPool.symbol}`}>
          More
        </Button>
      ),
    };
  });

  return (
    <S.Table dataSource={dataSource} columns={columns} pagination={false} />
  );
}

const columns = [
  {
    title: "Symbol",
    dataIndex: "symbol",
    key: "symbol",
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Supply",
    dataIndex: "supply",
    key: "supply",
  },
  {
    title: "Market Cap",
    dataIndex: "marketCap",
    key: "marketCap",
  },
  {
    title: "Swap Fee",
    dataIndex: "swapFee",
    key: "swapFee",
  },
  {
    title: "Cumulative Fees",
    dataIndex: "cumulativeFees",
    key: "cumulativeFees",
  },
  {
    title: "Volume",
    dataIndex: "volume",
    key: "volume",
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
  },
];

const S = {
  Table: styled(Table)``,
};
