import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, Col, Row, Statistic } from "antd";
import { INDEX_POOL_TAGLINES } from "config";
import { Link, useHistory } from "react-router-dom";
import { Widget } from "./Widget";
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
    <Widget
      symbol={props.symbol}
      address={props.id}
      price={props.priceUsd}
      stats={
        <Statistic
          title="Total Value Locked"
          value={props.totalValueLocked}
          valueRender={(value) => <div className="colorful">{value}</div>}
        />
      }
      actions={
        <Button type="primary" onClick={(event) => event.stopPropagation()}>
          <Link to={`${props.slug}?interaction=trade`}>Buy</Link>
        </Button>
      }
      onClick={() => push(props.slug)}
    >
      <div style={{ height: 150 }}>{INDEX_POOL_TAGLINES[props.id] ?? ""}</div>
    </Widget>
  );
}
