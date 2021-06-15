import { Col, Row } from "antd";
import { FormattedIndexPool } from "features";
import {
  IndexPoolDescription,
  IndexPoolExternalLinks,
  Page,
} from "components/atomic";
import { TradeInteraction } from "components/interactions";
import { useLocation } from "react-router";

export default function Buy() {
  const { state } = useLocation<{ indexPool: FormattedIndexPool }>();

  return (
    <Page hasPageHeader={true} title={`Buy ${state.indexPool.name}`}>
      <Row gutter={24}>
        <Col xs={24} sm={8}>
          <IndexPoolDescription {...state.indexPool} />
          <IndexPoolExternalLinks {...state.indexPool} />
        </Col>
        <Col xs={24} sm={16}>
          <TradeInteraction indexPool={state.indexPool} />
        </Col>
      </Row>
    </Page>
  );
}
