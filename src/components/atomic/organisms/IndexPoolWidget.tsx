import { AppState, FormattedIndexPool, selectors } from "features";
import { Card, Col, Row, Statistic } from "antd";
import { INDEX_POOL_TAGLINES } from "config";
import { Quote } from "../molecules";
import { Token } from "../atoms";
import { useHistory } from "react-router-dom";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

export function IndexPoolWidgetGroup() {
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <Row gutter={[20, 20]}>
      {indexPools.map((pool) => (
        <Col xs={24} sm={6} key={pool.id}>
          <IndexPoolWidget {...pool} />
        </Col>
      ))}
    </Row>
  );
}

export function IndexPoolWidget(props: FormattedIndexPool) {
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenAddresses(state, props.id)
  );
  const { push } = useHistory();

  usePoolDetailRegistrar(props.id, tokenIds);

  return (
    <Card
      title={<Token size="medium" symbol={props.symbol} name={props.name} />}
      className="IndexPoolWidget"
      actions={[
        <Statistic
          key="tvl"
          title="Total Value Locked"
          value={props.totalValueLocked}
          valueRender={(value) => <div className="colorful">{value}</div>}
        />,
      ]}
      hoverable={true}
      extra={<Quote address={props.id} price={props.priceUsd} inline={true} />}
      onClick={() => push(props.slug)}
    >
      <Card.Meta description={INDEX_POOL_TAGLINES[props.id] ?? ""} />
    </Card>
  );
}
