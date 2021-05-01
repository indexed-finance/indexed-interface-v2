import { AppState, FormattedStakingData, selectors } from "features";
import { Badge, Button, Space, Statistic } from "antd";
import { FaTractor } from "react-icons/fa";
import { Widget } from "./Widget";
import { convert } from "helpers";
import {
  useBreakpoints,
  usePoolDetailRegistrar,
  useStakingApy,
  useStakingTokenPrice,
  useTranslator,
} from "hooks";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

export function StakingWidget(props: FormattedStakingData) {
  const tx = useTranslator();
  const apy = useStakingApy(props.id);
  const price = useStakingTokenPrice(props.id);
  const isExpired = apy === "Expired";
  const relevantIndexPool = useSelector((state: AppState) =>
    selectors.selectPoolBySymbol(state, props.symbol)
  );
  const formattedIndexPool = useSelector((state: AppState) =>
    relevantIndexPool
      ? selectors.selectFormattedIndexPool(state, relevantIndexPool.id)
      : null
  );
  const symbol = props.isWethPair ? `ETH/${props.symbol}` : props.symbol;
  const tokenIds = useSelector((state: AppState) =>
    formattedIndexPool
      ? selectors.selectPoolTokenIds(state, formattedIndexPool.id)
      : []
  );
  const { push } = useHistory();
  const { isMobile } = useBreakpoints();
  const inner = (
    <Widget
      width={isMobile ? 330 : 420}
      symbol={symbol}
      address={props.id}
      price={price ? convert.toCurrency(price) : ""}
      onClick={() =>
        props.isWethPair
          ? window.open(
              `https://info.uniswap.org/pair/${props.stakingToken.toLowerCase()}`
            )
          : push(props.slug)
      }
      stats={
        <Space direction="vertical">
          {!isExpired && (
            <>
              <Statistic title={tx("APY")} value={apy ?? ""} />
              <Statistic title={tx("RATE")} value={props.rate} />
            </>
          )}
          <Statistic title={tx("STAKED")} value={`${props.staked} ${symbol}`} />
          <Statistic title={tx("EARNED")} value={props.earned} />
        </Space>
      }
      actions={
        <Button
          type={isExpired ? "ghost" : "primary"}
          disabled={isExpired}
          size="large"
        >
          <Space>
            <FaTractor style={{ position: "relative", top: 2 }} />
            <span>{isExpired ? tx("STAKING_EXPIRED") : tx("STAKE")}</span>
          </Space>
        </Button>
      }
    />
  );

  usePoolDetailRegistrar(formattedIndexPool?.id ?? "", tokenIds);

  return props.isWethPair ? (
    <Badge.Ribbon text="Uniswap V2" color="purple" style={{ top: -6 }}>
      {inner}
    </Badge.Ribbon>
  ) : (
    inner
  );
}
