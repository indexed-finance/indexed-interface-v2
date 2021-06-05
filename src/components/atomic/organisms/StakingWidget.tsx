import { Badge, Button, Divider, Space, Statistic } from "antd";
import { FaTractor } from "react-icons/fa";
import { FormattedStakingData } from "features";
import { Link, useHistory } from "react-router-dom";
import { Widget } from "./Widget";
import { convert } from "helpers";
import { useStakingApy, useStakingTokenPrice, useTranslator } from "hooks";

export function StakingWidget(props: FormattedStakingData) {
  const tx = useTranslator();
  const apy = useStakingApy(props.id);
  const price = useStakingTokenPrice(props.id);
  const isExpired = apy === "Expired";
  const symbol = props.isWethPair ? `ETH/${props.symbol}` : props.symbol;
  const { push } = useHistory();
  const inner = (
    <div style={{ position: "relative" }}>
      <Widget
        symbol={symbol}
        address={props.id}
        price={price ? convert.toCurrency(price) : ""}
        onClick={() => push(`/staking/${props.id}`)}
        stats={
          <>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic
                style={{ width: "100%" }}
                title="Total Staked"
                value={`${props.totalStaked} ${symbol}`}
              />
              <Statistic
                style={{ width: "100%" }}
                title={tx("STAKED")}
                value={`${props.staked} ${symbol}`}
              />
              <Statistic
                style={{ width: "100%" }}
                title={tx("EARNED")}
                value={props.earned}
              />

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
            <Divider />
            <Button
              type={isExpired ? "ghost" : "primary"}
              size="large"
              onClick={(event) => event.stopPropagation()}
              block={true}
            >
              <Link to={`/staking/${props.id}`}>
                <Space>
                  <FaTractor style={{ position: "relative", top: 2 }} />
                  <span>{isExpired ? tx("STAKING_EXPIRED") : tx("STAKE")}</span>
                </Space>
              </Link>
            </Button>
          </>
        }
      />
    </div>
  );

  return props.isWethPair ? (
    <Badge.Ribbon text="Uniswap V2" color="purple" style={{ top: -6 }}>
      {inner}
    </Badge.Ribbon>
  ) : (
    inner
  );
}
