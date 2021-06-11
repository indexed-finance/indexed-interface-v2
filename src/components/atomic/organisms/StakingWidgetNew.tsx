import { Button, Col, Row, Space, Statistic } from "antd";
import { FaTractor } from "react-icons/fa";
import { FormattedNewStakingData } from "features";
import { Link, useHistory } from "react-router-dom";
import { Widget } from "./Widget";
import { convert } from "helpers";
import {
  useNewStakingApy,
  useNewStakingTokenPrice,
  useTranslator,
} from "hooks";

export function StakingWidgetNew(props: FormattedNewStakingData) {
  const tx = useTranslator();
  const apy = useNewStakingApy(props.id);
  const price = useNewStakingTokenPrice(props.id);
  const symbol = props.symbol;
  const { push } = useHistory();

  return (
    <div style={{ position: "relative" }}>
      <Widget
        badge={props.liquidityProvider || props.isWethPair ? "Uniswap V2" : ""}
        badgeColor="pink"
        symbol={symbol}
        address={props.id}
        price={price ? convert.toCurrency(price) : ""}
        onClick={() => push(`/staking-new/${props.id}`)}
        stats={
          <Space direction="vertical" style={{ width: "100%" }}>
            <Statistic
              title="Total Staked"
              value={`${props.totalStaked} ${symbol}`}
            />
            <Row style={{ width: "100%" }} justify="center">
              <Col span={12}>
                <Statistic
                  style={{ width: "100%" }}
                  title={tx("STAKED")}
                  value={`${props.staked} ${symbol}`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  style={{ width: "100%" }}
                  title={tx("EARNED")}
                  value={props.earned}
                />
              </Col>
            </Row>
            <Statistic title={tx("APY")} value={apy ?? ""} />
            <Statistic title={tx("RATE")} value={props.rewardsPerDay} />
          </Space>
        }
        actions={
          <>
            <Button
              type={"primary"}
              size="large"
              onClick={(event) => event.stopPropagation()}
              block={true}
            >
              <Link to={`/staking-new/${props.id}`}>
                <Space>
                  <FaTractor style={{ position: "relative", top: 2 }} />
                  <span>{tx("STAKE")}</span>
                </Space>
              </Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
