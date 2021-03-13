import { AppState, selectors } from "features";

import { Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Pool from "app/subscreens/Pool";

export default function PoolDetail() {
  const { poolName } = useParams<{ poolName: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, poolName)
  );
  if (poolId === undefined) return <></>
  if (!poolId) return <Redirect to="/pools" />;
  return <Pool poolId={poolId} poolName={poolName} />;
}
