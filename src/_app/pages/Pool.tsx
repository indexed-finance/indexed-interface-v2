import { AppState, selectors } from "features";
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
import { PoolInteractions } from "app/interactions";
import { Recent, Subscreen } from "app/subscreens";
import { Redirect, useParams } from "react-router-dom";
import { useBreakpoints, usePoolDetailRegistrar, useTranslator } from "hooks";
import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";

export function Pool() {
  const { poolName } = useParams<{ poolName: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, poolName)
  );
  if (poolId === undefined) {
    return null;
    // <div style={{ padding: 20 }}>
    //   <ProviderRequirementDrawer />
    // </div>
  } else if (!poolId) {
    return <Redirect to="/pools" />;
  } else {
    return <Inner id={poolId} />;
  }
}

function Inner({ id }: { id: string }) {
  const tx = useTranslator();
  const pool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, id)
  );
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, id)
  );
  const breakpoints = useBreakpoints();
  const { setAbovePage, clearAbovePage } = {
    setAbovePage: () => {
      /** */
    },
    clearAbovePage: () => {
      /** */
    },
  };

  usePoolDetailRegistrar(id, tokenIds);

  // Effect:
  // On initial load, set the area above the page to have useful links.
  useEffect(() => {
    // setAbovePage(<UsefulLinks address={id} />);

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
        <Space wrap={true} style={{ padding: 10, width: "100%" }}>
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
        {performance}
        {(() => {
          switch (true) {
            case breakpoints.xxl:
              return desktopSized;
            case breakpoints.xl:
              return tabletSized;
            case breakpoints.lg:
              return mobileSized;
            case breakpoints.md:
              return mobileSized;
            case breakpoints.sm:
              return mobileSized;
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
