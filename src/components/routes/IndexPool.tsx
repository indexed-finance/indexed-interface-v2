import { Alert, Col, Divider, Row, Space, Spin, Typography } from "antd";
import { AppState, FormattedIndexPool, selectors } from "features";
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
import { ReactNode, useCallback, useState } from "react";
import { useBreakpoints, usePoolDetailRegistrar } from "hooks";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export function LoadedIndexPool(
  props: FormattedIndexPool & {
    interaction?: ReactNode;
    interactionTitle: string;
  }
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
            <Col span={24}>
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
  const [interactionTitle, setInteractionTitle] = useState("");
  const handleInteractionBarChange = useCallback(
    (content: ReactNode, title: "buy" | "burn" | "mint") => {
      setInteraction(content);
      setInteractionTitle(title);
    },
    []
  );

  return (
    <Page
      extra={
        <div>
          {indexPool ? <IndexPoolPerformance {...indexPool} /> : <Spin />}
        </div>
      }
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
              onChange={handleInteractionBarChange}
            />
          </div>
        ) : (
          <Spin />
        )
      }
      hasPageHeader={true}
    >
      {indexPool ? (
        <>
          {["FFF", "CC10", "DEFI5"].includes(indexPool?.symbol ?? "") && (
            <Alert
              type="warning"
              message={
                <>
                  This index was disabled in the aftermath of the October 2021
                  attack on Indexed Finance as a result of{" "}
                  <a href="https://www.withtally.com/governance/indexed/proposal/16">
                    governance proposal 16
                  </a>
                  . They can no longer be traded, minted or burned.
                  <a href="https://twitter.com/ndxfi">
                    See Twitter for addl. information.
                  </a>
                </>
              }
            />
          )}
          <LoadedIndexPool
            interaction={interaction}
            interactionTitle={interactionTitle}
            {...indexPool}
          />
        </>
      ) : (
        <Spin />
      )}
    </Page>
  );
}
