import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, Col, Row, Statistic } from "antd";
import { Link, useHistory } from "react-router-dom";
import { Widget } from "./Widget";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

const INDEX_POOL_TAGLINES: Record<string, string> = {
  // CC10
  "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3":
    "An index covering the most popular medium/large-cap Ethereum protocols, primarily drawn from decentralized finance.",
  // DEFI5
  "0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41":
    "A hyper-focused index of the most successful large-cap decentralized finance protocols across Ethereum.",
  // ORCL5
  "0xd6cb2adf47655b1babddc214d79257348cbc39a7":
    "An index representing the current market leaders in protocols designed to bring external/real-world data onto the blockchain.",
  // DEGEN
  "0x126c121f99e1e211df2e5f8de2d96fa36647c855":
    "A higher risk/reward index of promising Ethereum protocols that are judged as having significant room to grow.",
  // NFTP
  "0x68bb81b3f67f7aab5fd1390ecb0b8e1a806f2465":
    "A collectors index of governance and protocol tokens drawn from both the NFT space and the wider Metaverse.",
  // ERROR
  "0xd3deff001ef67e39212f4973b617c2e684fa436c":
    "A barbell-weighted fund tracking the favoured projects of 0xb1.484, one of the largest capital providers in DeFi.",
};

export function IndexPoolWidgetGroup() {
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <Row gutter={[20, 20]}>
      {indexPools.map((pool) => (
        <Col span={8} key={pool.id}>
          <IndexPoolWidget {...pool} />
        </Col>
      ))}
    </Row>
  );
}

export function IndexPoolWidget(props: FormattedIndexPool) {
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, props.id)
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
