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
import { ReactNode, useState } from "react";
import { useBreakpoints, usePoolDetailRegistrar } from "hooks";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export function LoadedIndexPool(
  props: FormattedIndexPool & { interaction?: ReactNode }
) {
  const { isMobile } = useBreakpoints();
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenAddresses(state, props.id)
  );

  usePoolDetailRegistrar(props.id, tokenIds);

  return (
    <>
      <div style={{ paddingTop: 12 }}>
        {props.interaction && (
          <Row gutter={12}>
            <Col span={8}>
              <div
                style={{
                  borderLeft: "2px solid #38EE7A",
                  paddingLeft: 24,
                  marginBottom: 24,
                }}
              >
                {props.interaction}
              </div>
            </Col>
          </Row>
        )}
        <Row
          align="stretch"
          gutter={{
            xs: 12,
            sm: 24,
          }}
        >
          <Col xs={24} md={8}>
            <Space
              size="large"
              direction="vertical"
              style={{ marginBottom: isMobile ? 24 : 0, display: "flex" }}
            >
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
    </>
  );
}

export default function IndexPool() {
  const { slug } = useParams<{ slug: string }>();
  const poolId = useSelector((state: AppState) =>
    selectors.selectPoolIdByName(state, slug)
  );
  const indexPool = useSelector((state: AppState) =>
    poolId ? selectors.selectFormattedIndexPool(state, poolId) : null
  );
  const [interaction, setInteraction] = useState<ReactNode>(null);

  return (
    <Page
      extra={indexPool ? <IndexPoolPerformance {...indexPool} /> : <Spin />}
      title={
        indexPool ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography.Text>{indexPool.name}</Typography.Text>
            <IndexPoolInteractionBar
              indexPool={indexPool}
              onChange={setInteraction}
            />
          </div>
        ) : (
          <Spin />
        )
      }
      hasPageHeader={true}
    >
      {indexPool ? (
        <LoadedIndexPool interaction={interaction} {...indexPool} />
      ) : (
        <Spin />
      )}
    </Page>
  );
}
