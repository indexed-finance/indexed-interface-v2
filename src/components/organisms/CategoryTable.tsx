import { FormattedCategory } from "features";
import { IndexCard } from "components/molecules";
import { Table } from "antd";
import { useBreakpoints } from "helpers";
import { useHistory } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "i18n";

interface Props {
  pools: FormattedCategory["indexPools"];
}

export function CategoryTable({ pools }: Props) {
  const tx = useTranslation();
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  const columns = useMemo(
    () => [
      {
        title: tx("SYMBOL"),
        dataIndex: "symbol",
        key: "symbol",
      },
      {
        title: tx("SIZE"),
        dataIndex: "size",
        key: "size",
      },
      {
        title: tx("PRICE"),
        dataIndex: "price",
        key: "price",
      },
      {
        title: tx("SUPPLY"),
        dataIndex: "supply",
        key: "supply",
      },
      {
        title: tx("MARKET_CAP"),
        dataIndex: "marketCap",
        key: "marketCap",
      },
      {
        title: tx("SWAP_FEE"),
        dataIndex: "swapFee",
        key: "swapFee",
      },
      {
        title: tx("CUMULATIVE_FEES"),
        dataIndex: "cumulativeFees",
        key: "cumulativeFees",
      },
      {
        title: tx("VOLUME"),
        dataIndex: "volume",
        key: "volume",
      },
      {
        title: "",
        dataIndex: "action",
        key: "action",
      },
    ],
    [tx]
  );

  return isMobile ? (
    <>
      {pools.map((pool) => (
        <IndexCard
          key={pool.name}
          direction="vertical"
          actions={Object.entries(pool)
            .filter(([key]) => !["name", "slug", "id"].includes(key))
            .map(([key, value]) => ({
              title: columns.find((column) => column.key === key)?.title ?? "",
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
