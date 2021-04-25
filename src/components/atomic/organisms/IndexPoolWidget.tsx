import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, Statistic } from "antd";
import { Widget } from "./Widget";
import { useBreakpoints, usePoolDetailRegistrar } from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

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
      actions={<Button type="primary">Buy</Button>}
      onClick={() => push(props.slug)}
    >
      This is a brief description of the purpose of this particular index pool.
    </Widget>
  );
}
