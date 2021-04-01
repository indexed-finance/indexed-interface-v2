import { Link } from "react-router-dom";
import { PoolCard, PoolDropdown, ScreenHeader } from "components";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";

interface Props {
  withBreadcrumb?: boolean;
}

export default function PoolList({ withBreadcrumb = true }: Props) {
  const tx = useTranslator();
  const pools = useSelector(selectors.selectAllFormattedIndexPools);
  const headerProps = withBreadcrumb
    ? {
        overlay: <PoolDropdown />,
        activeBreadcrumb: <Link to="/pools">{tx("INDEX_POOLS")}</Link>,
      }
    : {};

  return (
    <div style={{ minHeight: 400, position: "relative" }}>
      <ScreenHeader title={tx("POOLS")} {...headerProps} />
      <Space direction="vertical" style={{ width: "100%" }}>
        {pools.map((pool) => (
          <PoolCard key={pool!.id} pool={pool!} />
        ))}
      </Space>
    </div>
  );
}
