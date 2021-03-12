import { Table } from "antd";
import { useHistory } from "react-router-dom";

import type { FormattedCategory } from "features";

export type Props = {
  pools: FormattedCategory["indexPools"];
};

export default function CategoryTable(props: Props) {
  const history = useHistory();

  return (
    <Table
      dataSource={props.pools}
      columns={columns}
      pagination={false}
      onRow={(record: any) => ({
        onClick: () => history.push(`/pools/${record.slug}`),
      })}
    />
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
