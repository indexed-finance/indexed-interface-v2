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
        <Col xs={24} sm={8} key={pool.id}>
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
      priceChange={props.netChangePercent}
      stats={<Statistic title="TVL" value={props.totalValueLocked} />}
      actions={
        <Button type="primary" onClick={(event) => event.stopPropagation()}>
          <Link to={`${props.slug}?interaction=trade`}>Buy</Link>
        </Button>
      }
      onClick={() => push(props.slug)}
    >
      {INDEX_POOL_TAGLINES[props.id] ?? ""}
    </Widget>
  );
}
