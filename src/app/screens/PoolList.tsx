import { Link } from "react-router-dom";
import { PoolCard, PoolDropdown, ScreenHeader } from "components";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";

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
    <div>
      <ScreenHeader title="Pools" {...headerProps} />
      <div>
        {pools.map((pool) => (
          <PoolCard key={pool!.id} pool={pool!} />
        ))}
      </div>
    </div>
  );
}
