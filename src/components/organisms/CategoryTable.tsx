import { FormattedCategory } from "features";
import { IndexCard } from "components/molecules";
import { Table } from "antd";
import { useBreakpoints } from "helpers";
import { useHistory } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "i18n";

export type Props = {
  pools: FormattedCategory["indexPools"];
};

export default function CategoryTable({ pools }: Props) {
  const translate = useTranslation();
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  const columns = useMemo(
    () => [
      {
        title: translate("SYMBOL"),
        dataIndex: "symbol",
        key: "symbol",
      },
      {
        title: translate("SIZE"),
        dataIndex: "size",
        key: "size",
      },
      {
        title: translate("PRICE"),
        dataIndex: "price",
        key: "price",
      },
      {
        title: translate("SUPPLY"),
        dataIndex: "supply",
        key: "supply",
      },
      {
        title: translate("MARKET_CAP"),
        dataIndex: "marketCap",
        key: "marketCap",
      },
      {
        title: translate("SWAP_FEE"),
        dataIndex: "swapFee",
        key: "swapFee",
      },
      {
        title: translate("CUMULATIVE_FEES"),
        dataIndex: "cumulativeFees",
        key: "cumulativeFees",
      },
      {
        title: translate("VOLUME"),
        dataIndex: "volume",
        key: "volume",
      },
      {
        title: "",
        dataIndex: "action",
        key: "action",
      },
    ],
    [translate]
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
