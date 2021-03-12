import { Link } from "react-router-dom";
import { PoolCard, PoolDropdown, ScreenHeader } from "components";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";

interface Props {
  withBreadcrumb?: boolean;
}

export default function PoolList({ withBreadcrumb = true }: Props) {
  const pools = useSelector(selectors.selectAllFormattedIndexPools);
  const headerProps = withBreadcrumb
    ? {
        overlay: <PoolDropdown />,
        activeBreadcrumb: <Link to="/pools">Index Pools</Link>,
      }
    : {};

  return (
    <>
      <ScreenHeader title="Pools" {...headerProps} />
      <Space direction="vertical" size="large">
        {pools.map((pool) => (
          <PoolCard key={pool!.id} pool={pool!} />
        ))}
      </Space>
    </>
  );
}
