import { FormattedCategory } from "features";
import { IndexCard } from "components";
import { Table } from "antd";
import { useBreakpoints } from "helpers";
import { useHistory } from "react-router-dom";
import S from "string";

export type Props = {
  pools: FormattedCategory["indexPools"];
};

export default function CategoryTable({ pools }: Props) {
  const history = useHistory();
  const { isMobile } = useBreakpoints();

  return isMobile ? (
    <>
      {pools.map((pool) => (
        <IndexCard
          key={pool.name}
          direction="vertical"
          actions={Object.entries(pool)
            .filter(([key]) => !["name", "slug", "id"].includes(key))
            .map(([key, value]) => ({
              title: S(key).humanize().s,
              value,
            }))}
        >
          <span style={{ fontSize: 16 }}>{pool.name}</span>
        </IndexCard>
      ))}
    </>
  ) : (
    <Table
      dataSource={pools}
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
