import { AppState, FormattedIndexPool, selectors } from "features";
import {
  ChartCard,
  PoolDropdown,
  ProviderRequirementDrawer,
  RankedToken,
  ScreenHeader,
} from "components";
import { Col, Divider, Row, Space } from "antd";
import { Link } from "react-router-dom";
import { Performance, Recent, Subscreen } from "app/subscreens";
import { PoolInteractions } from "app/interactions";
import { Redirect, useParams } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import { useTokenUserDataListener } from "ethereum/listeners";

export default function PoolDetail() {
  const { poolName } = useParams<{ poolName: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, poolName)
  );
  if (poolId === undefined) return <></>;
  if (!poolId) return <Redirect to="/pools" />;
  return <Pool poolId={poolId} poolName={poolName} />;
}

type Props = { poolId: string; poolName: string };
function Pool({ poolId }: Props) {
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, poolId)
  ) as FormattedIndexPool;
  const breakpoints = useBreakpoints();
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, poolId)
  );
  useTokenUserDataListener(poolId, tokenIds);

  // Subscreens
  const performance = <Performance pool={pool} />;
  const chart = (
    <Subscreen title="Performance">
      {poolId ? <ChartCard poolId={poolId} /> : null}
    </Subscreen>
  );
  const assets = (
    <Subscreen title="Assets">
      <Space wrap={true} align="start" className="RankedTokenWrapper">
        {pool.assets.map((token, index) => (
          <RankedToken key={token.symbol} rank={index + 1} token={token} />
        ))}
      </Space>
      {/* */}
    </Subscreen>
  );
  const interactions = (
    <Subscreen title="Interactions">
      <ProviderRequirementDrawer includeSignerRequirement={true} />
      <PoolInteractions pool={pool} />
    </Subscreen>
  );
  const recents = <Recent pool={pool} />;

  // Variants
  const mobileSized = (
    <Row>
      <Col span={24}>{interactions}</Col>
      <Col span={24}>{assets}</Col>
      <Col span={24}>{recents}</Col>
    </Row>
  );
  const tabletSized = (
    <>
      <Row gutter={25}>
        <Col span={12}>
          {assets}
          {interactions}
        </Col>
      </Row>
      <Row gutter={25}>
        <Col span={24}>{recents}</Col>
      </Row>
    </>
  );

  const desktopSized = (
    <>
      <Row gutter={20}>
        <Col span={12}>{chart}</Col>
        <Col span={12}>{interactions}</Col>
      </Row>
      <Row gutter={20}>
        <Col span={12}>{assets}</Col>
        <Col span={12}>{recents}</Col>
      </Row>
    </>
  );

  return (
    <>
      <ScreenHeader
        title={pool.name}
        overlay={<PoolDropdown />}
        activeBreadcrumb={<Link to="/pools">Index Pools</Link>}
      />
      {performance}
      <Divider style={{ marginTop: 0 }} />
      {(() => {
        switch (true) {
          case breakpoints.xxl:
            return desktopSized;
          case breakpoints.xl:
            return tabletSized;
          case breakpoints.lg:
            return tabletSized;
          case breakpoints.md:
            return tabletSized;
          case breakpoints.sm:
            return tabletSized;
          case breakpoints.xs:
            return mobileSized;
        }
      })()}
    </>
  );
}
