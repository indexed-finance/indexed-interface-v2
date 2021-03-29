import { AppState, selectors } from "features";
import { ChartCard, PoolDropdown, ScreenHeader } from "components";
import { Link, Redirect, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "i18n";

export default function PoolChart() {
  const tx = useTranslation();
  const { poolName } = useParams<{ poolName: string }>();
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolName)
  );

  if (pool) {
    return (
      <>
        <ScreenHeader
          title={tx("X_CHART", {
            __x: pool.name,
          })}
          overlay={<PoolDropdown />}
          activeBreadcrumb={<Link to="/pools">{tx("INDEX_POOLS")}</Link>}
        />
        <ChartCard poolId={pool.id} expanded={true} />;
      </>
    );
  } else {
    return <Redirect to="/pools" />;
  }
}
