import { AbovePageContext } from "../AppLayout";
import { AppState, actions, selectors } from "features";
import {
  ChartCard,
  Performance,
  PoolDropdown,
  ProviderRequirementDrawer,
  RankedToken,
  ScreenHeader,
  UsefulLinks,
} from "components";
import { Col, Row, Space } from "antd";
import { Link } from "react-router-dom";
import { PoolInteractions } from "../interactions";
import { Recent, Subscreen } from "../subscreens";
import { Redirect, useParams } from "react-router-dom";
import { useBreakpoints, usePoolDetailRegistrar } from "hooks";
import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";

export default function PoolDetail() {
  const { poolName } = useParams<{ poolName: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, poolName)
  );
  if (poolId === undefined) {
    return (
      <div style={{ padding: 20 }}>
        <ProviderRequirementDrawer />
      </div>
    );
  } else if (!poolId) {
    return <Redirect to="/pools" />;
  } else {
    return <Pool id={poolId} />;
  }
}

function Pool({ id }: { id: string }) {
  const tx = useTranslator();
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, id)
  );
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, id)
  );
  const breakpoints = useBreakpoints();
  const { setAbovePage, clearAbovePage } = useContext(AbovePageContext);

  usePoolDetailRegistrar(id, tokenIds, actions, selectors);

  // Effect:
  // On initial load, set the area above the page to have useful links.
  useEffect(() => {
    setAbovePage(<UsefulLinks address={id} />);

    return () => {
      clearAbovePage();
    };
  }, [setAbovePage, clearAbovePage, id]);

  if (pool) {
    const performance = <Performance pool={pool} />;
    const chart = (
      <Subscreen title={tx("PERFORMANCE")}>
        {id ? <ChartCard poolId={id} /> : null}
      </Subscreen>
    );
    const assets = (
      <Subscreen title={tx("ASSETS")}>
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
      </Subscreen>
    );
    const interactions = (
      <Subscreen title={tx("INTERACTIONS")}>
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
          <Col span={12}>{chart}</Col>
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
      <div style={{ position: "relative" }}>
        <ScreenHeader
          title={pool.name}
          overlay={<PoolDropdown />}
          activeBreadcrumb={<Link to="/pools">{tx("INDEX_POOLS")}</Link>}
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
      </div>
    );
  } else {
    return <Redirect to="/pools" />;
  }
}
