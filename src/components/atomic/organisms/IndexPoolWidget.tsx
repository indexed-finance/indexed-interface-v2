import { AppState, FormattedIndexPool, selectors } from "features";
import { Card, Col, Row, Statistic } from "antd";
import { Fade } from "components/animations";
import { INDEX_POOL_TAGLINES } from "config";
import { Quote } from "../molecules";
import { Token } from "../atoms";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

export function IndexPoolWidgetGroup() {
  const [fadedWidget, setFadedWidget] = useState(-1);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);

  useEffect(() => {
    if (fadedWidget < indexPools.length - 1) {
      setTimeout(() => {
        setFadedWidget((prev) => prev + 1);
      }, 200);
    }
  }, [fadedWidget, indexPools]);

  return (
    <Row gutter={[20, 20]}>
      {indexPools.map((pool, index) => (
        <Col xs={24} sm={8} key={pool.id}>
          <Fade in={fadedWidget >= index}>
            <IndexPoolWidget {...pool} />
          </Fade>
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

  let value = props.totalValueLocked;
  value = value.substring(0, value.length - 3);

  return (
    <Card
      title={<Token size="medium" symbol={props.symbol} name={props.name} />}
      className="IndexPoolWidget"
      actions={[
        <Statistic
          key="tvl"
          title="Total Value Locked"
          value={value}
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
