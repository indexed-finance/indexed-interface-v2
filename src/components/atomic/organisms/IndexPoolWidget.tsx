import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, Statistic } from "antd";
import { Link, useHistory } from "react-router-dom";
import { Widget, WidgetGroup } from "./Widget";
import { useBreakpoints, usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

export function IndexPoolWidgetGroup() {
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <WidgetGroup>
      {indexPools.map((pool) => (
        <IndexPoolWidget key={pool.id} {...pool} />
      ))}
    </WidgetGroup>
  );
}

export function IndexPoolWidget(props: FormattedIndexPool) {
  const { isMobile } = useBreakpoints();
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, props.id)
  );
  const { push } = useHistory();

  usePoolDetailRegistrar(props.id, tokenIds);

  return (
    <Widget
      width={isMobile ? 280 : 340}
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
      This is a brief description of the purpose of this particular index pool.
    </Widget>
  );
}
