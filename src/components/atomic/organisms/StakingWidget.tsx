import { AppState, FormattedStakingData, selectors } from "features";
import { Badge, Button, Drawer, Space, Statistic } from "antd";
import { FaTractor } from "react-icons/fa";
import { StakeInteraction } from "components/interactions";
import { Widget } from "./Widget";
import { convert } from "helpers";
import { useHistory } from "react-router-dom";
import {
  usePoolDetailRegistrar,
  useStakingApy,
  useStakingTokenPrice,
  useTranslator,
} from "hooks";
import { useSelector } from "react-redux";
import { useState } from "react";

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
  const [showingStakingForm, setShowingStakingForm] = useState(false);
  const inner = (
    <div style={{ position: "relative" }}>
      <Widget
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
            <Statistic
              title={tx("STAKED")}
              value={`${props.staked} ${symbol}`}
            />
            <Statistic title={tx("EARNED")} value={props.earned} />
            <Statistic
              title={tx("APY")}
              value={apy ?? "Expired"}
              valueStyle={{ color: isExpired ? "#333" : "inherit" }}
            />
            <Statistic
              title={tx("RATE")}
              value={isExpired ? "Expired" : props.rate}
              valueStyle={{ color: isExpired ? "#333" : "inherit" }}
            />
          </Space>
        }
        actions={
          <>
            <Button
              type={isExpired ? "ghost" : "primary"}
              disabled={isExpired}
              size="large"
              onClick={(event) => {
                event.stopPropagation();
                setShowingStakingForm(true);
              }}
            >
              {formattedIndexPool && (
                  <Space>
                    <FaTractor style={{ position: "relative", top: 2 }} />
                    <span>
                      {isExpired ? tx("STAKING_EXPIRED") : tx("STAKE")}
                    </span>
                  </Space>
              )}
            </Button>
          </>
        }
      />
      {formattedIndexPool && showingStakingForm && (
        <Drawer
          getContainer={false}
          style={{ position: "absolute", left: 0, top: 75}}
          width="98%"
          placement="right"
          visible={true}
          closable={true}
          onClose={() => setShowingStakingForm(false)}
        >
          <StakeInteraction indexPool={formattedIndexPool} />
        </Drawer>
      )}
    </div>
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
