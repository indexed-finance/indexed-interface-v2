import { Button, Col, Row, Space, Statistic } from "antd";
import { FaTractor } from "react-icons/fa";
import { FormattedMasterChefData } from "features/masterChef";
import { Link, useHistory } from "react-router-dom";
import { Widget } from "./Widget";
import { convert } from "helpers";
import { useMasterChefApy } from "hooks/masterchef-hooks";
import {
  usePairTokenPrice,
  useTranslator,
} from "hooks";

export function MasterChefStakingWidget(props: FormattedMasterChefData) {
  const tx = useTranslator();
  const apy = useMasterChefApy(props.id);
  const price = usePairTokenPrice(props.stakingToken);
  let symbol = props.symbol;
  if (props.stakingToken.toLowerCase() === '0x8911fce375a8414b1b578be66ee691a8d2d4dbf7') {
    symbol = 'ETH-NDX';
  }
  const { push } = useHistory();

  return (
    <div style={{ position: "relative" }}>
      <Widget
        badge={"Sushiswap"}
        badgeColor="violet"
        symbol={symbol}
        address={props.stakingToken}
        price={price ? convert.toCurrency(price) : ""}
        onClick={() => push(`/stake-sushi/${props.id}`)}
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
              <Link to={`/stake-sushi/${props.id}`}>
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
