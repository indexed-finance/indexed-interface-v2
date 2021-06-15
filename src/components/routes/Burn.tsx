import { BurnInteraction } from "components/interactions";
import { Col, Menu, Row } from "antd";
import { FormattedIndexPool } from "features";
import {
  IndexPoolDescription,
  IndexPoolExternalLinks,
  Page,
} from "components/atomic";
import { useLocation } from "react-router";
import { useState } from "react";

export default function Burn() {
  const { state } = useLocation<{ indexPool: FormattedIndexPool }>();
  const [activeKey, setActiveKey] = useState<"single" | "multi" | "router">(
    "single"
  );

  return (
    <Page
      hasPageHeader={true}
      title={
        <div>
          <span>Burn {state.indexPool.name}</span>
          <Menu
            mode="horizontal"
            style={{ marginLeft: -12 }}
            activeKey={activeKey}
            defaultActiveFirst={true}
          >
            <Menu.Item onClick={() => setActiveKey("single")}>Single</Menu.Item>
            <Menu.Item onClick={() => setActiveKey("multi")}>Multi</Menu.Item>
            <Menu.Item onClick={() => setActiveKey("router")}>Router</Menu.Item>
          </Menu>
        </div>
      }
    >
      <Row gutter={24}>
        <Col xs={24} sm={8}>
          <IndexPoolDescription {...state.indexPool} />
          <IndexPoolExternalLinks {...state.indexPool} />
        </Col>
        <Col xs={24} sm={16}>
          <BurnInteraction
            indexPool={state.indexPool}
            multi={activeKey === "multi"}
            uniswap={activeKey === "router"}
          />
        </Col>
      </Row>
    </Page>
  );
}
