import { AppState, FormattedIndexPool, selectors } from "features";
import { Col, Divider, Row, Space, Spin, Typography } from "antd";
import {
  IndexPoolAssets,
  IndexPoolChart,
  IndexPoolDescription,
  IndexPoolExternalLinks,
  IndexPoolInteractionBar,
  IndexPoolPerformance,
  IndexPoolRecentTrades,
  Page,
} from "components/atomic";
import { IndexPoolInteraction, useInteractionDrawer } from "components/drawers";
import { useEffect } from "react";
import { useParams } from "react-router";
import { usePoolDetailRegistrar, useQuery, useStakingApy } from "hooks";
import { useSelector } from "react-redux";

function LoadedIndexPool(props: FormattedIndexPool) {
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, props.id)
  );

  usePoolDetailRegistrar(props.id, tokenIds);

  return <div style={{ paddingTop: 12 }}>
  <Row
    align="stretch"
    gutter={{
      xs: 12,
      sm: 24,
    }}
  >
    <Col xs={24} md={8}>
      <Space size="large" direction="vertical">
        <IndexPoolDescription {...props} />
        <IndexPoolExternalLinks {...props} />
      </Space>
    </Col>
    <Col xs={24} md={16}>
    <IndexPoolChart poolId={props.id} />
    </Col>
  </Row>
  <Divider />
  <Row
    gutter={{
      xs: 12,
      sm: 24,
    }}
  >
    <Col xs={24} md={10}>
      <IndexPoolAssets {...props} />
    </Col>
    <Col xs={24} md={14}>
      <IndexPoolRecentTrades {...props} />
    </Col>
  </Row>
</div>
}

export default function IndexPool() {
  const { slug } = useParams<{ slug: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, slug)
  );
  const indexPool = useSelector((state: AppState) =>
    poolId ? selectors.selectFormattedIndexPool(state, poolId) : null
  );
  const query = useQuery();
  const { open: openInteraction } = useInteractionDrawer(poolId ?? "");
  const stakingApy = useStakingApy(poolId ?? "");

  useEffect(() => {
    const interaction = query.get("interaction");

    if (interaction && indexPool) {
      openInteraction(interaction as IndexPoolInteraction);

      if (
        interaction !== "stake" ||
        (interaction === "stake" && stakingApy && stakingApy !== "Expired")
      ) {
        openInteraction(interaction as IndexPoolInteraction);
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Page
      extra={indexPool ? <IndexPoolPerformance {...indexPool} /> : <Spin />}
      actions={indexPool && <IndexPoolInteractionBar indexPool={indexPool} />}
      title={
        indexPool ? (
          <Space>
            <Typography.Text>{indexPool.name}</Typography.Text>
          </Space>
        ) : (
          <Spin />
        )
      }
      hasPageHeader={true}
    >
      {indexPool ? (
        <LoadedIndexPool {...indexPool} />
      ) : (
        <Spin />
      )}
    </Page>
  );
}
