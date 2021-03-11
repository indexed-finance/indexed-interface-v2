import { AppState, selectors } from "features";
import { ChartCard, PoolDropdown, ScreenHeader } from "components";
import { Link, Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";

export default function PoolChart() {
  const { poolName } = useParams<{ poolName: string }>();
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolName)
  );

  if (pool) {
    return (
      <>
        <ScreenHeader
          title={`${pool.name} Chart`}
          overlay={<PoolDropdown />}
          activeBreadcrumb={<Link to="/pools">Index Pools</Link>}
        />
        <ChartCard poolId={pool.id} expanded={true} />;
      </>
    );
  } else {
    return <Redirect to="/pools" />;
  }
}
