import { AppState, hooks, selectors } from "features";
import {
  ChartCard,
  PoolDropdown,
  ProviderRequirementDrawer,
  RankedToken,
  ScreenHeader,
} from "components";
import { Col, Row, Space } from "antd";
import { Link } from "react-router-dom";
import { Performance, Recent, Subscreen } from "app/subscreens";
import { PoolInteractions } from "app/interactions";
import { Redirect, useParams } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";

const { useDataListener } = hooks;

export default function PoolDetail() {
  const { poolName } = useParams<{ poolName: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, poolName)
  );
  if (poolId === undefined) return <></>;
  if (!poolId) return <Redirect to="/pools" />;
  return <Pool id={poolId} />;
}

function Pool({ id }: { id: string }) {
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, id)
  );
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, id)
  );
  const breakpoints = useBreakpoints();

  useDataListener("TokenUserData", id, tokenIds);

  if (pool) {
    // Subscreens
    const performance = <Performance pool={pool} />;
    const chart = (
      <Subscreen title="Performance">
        {id ? <ChartCard poolId={id} /> : null}
      </Subscreen>
    );
    const assets = (
      <Subscreen title="Assets">
        <Space
          wrap={true}
          align="start"
          className="RankedTokenWrapper"
          style={{ padding: 10 }}
        >
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
        <Col span={24}>{chart}</Col>
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
  } else {
    return <Redirect to="/pools" />;
  }
}
