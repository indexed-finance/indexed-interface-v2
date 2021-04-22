import {
  Button,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { FaTractor } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Token } from "components/atomic";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useStakingApy, useStakingRegistrar, useTranslator } from "hooks";
import type { FormattedStakingData } from "features";

function StakingItem({
  id,
  isWethPair,
  symbol,
  slug,
  name,
  staked,
  stakingToken,
  earned,
  rate,
}: FormattedStakingData) {
  const tx = useTranslator();
  const apy = useStakingApy(id);
  const isExpired = apy === "Expired";
  const title = isWethPair ? (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://info.uniswap.org/pair/${stakingToken.toLowerCase()}`}
    >
      Uniswap V2 Pair for ETH-{symbol}
    </a>
  ) : (
    <Link to={`/pools/${slug}`}>{name}</Link>
  );

  return (
    <List.Item style={{ paddingRight: 20, paddingLeft: 20 }}>
      <div
        className="colored-text"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Token
              name={name}
              image=""
              address={id}
              symbol={symbol}
              amount={staked}
            />
            <Typography.Title level={3}>{title}</Typography.Title>
          </Space>
        </Space>
      </div>
      <Space
        size="large"
        style={{
          width: "100%",
          marginTop: 10,
          justifyContent: "space-between",
        }}
      >
        <Space>
          {!isExpired && (
            <>
              <Statistic key="apy" title={tx("APY")} value={apy ?? ""} />
              <Divider type="vertical" />
              <Statistic
                key="rate"
                title={tx("RATE")}
                className="colored-text"
                value={rate}
              />
              <Divider type="vertical" />
            </>
          )}
          <Statistic
            key="earned"
            title={tx("EARNED")}
            className="colored-text"
            value={earned}
          />
        </Space>
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
      </Space>
    </List.Item>
  );
}

export default function Stake() {
  const tx = useTranslator();
  const staking = useSelector(selectors.selectFormattedStaking);

  useStakingRegistrar();

  return (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Typography.Title level={3}>{tx("INDEX_TOKENS")}</Typography.Title>
          }
        >
          <List itemLayout="vertical">
            {staking.indexTokens.map((token) => (
              <StakingItem key={token.id} {...token} />
            ))}
          </List>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Typography.Title level={3}>
              {tx("LIQUIDITY_TOKENS")}
            </Typography.Title>
          }
        >
          <List itemLayout="vertical">
            {staking.liquidityTokens.map((token) => (
              <StakingItem key={token.id} {...token} />
            ))}
          </List>
        </Card>
      </Col>
    </Row>
  );
}
