import { AppState, FormattedPortfolioAsset, selectors } from "features";
import { Card, Space, Statistic, Typography } from "antd";
import { ExternalLink, Progress, Token } from "../atoms";
import { Link } from "react-router-dom";
import { Quote } from "../molecules";
import { ReactNode } from "react";
import { convert } from "helpers";
import { useBreakpoints, usePoolDetailRegistrar, useTranslator } from "hooks";
import { useSelector } from "react-redux";

export function PortfolioWidget(props: FormattedPortfolioAsset) {
  const tx = useTranslator();
  const isNdx = props.symbol === "NDX";
  const { isMobile } = useBreakpoints();
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenAddresses(state, props.address)
  );
  const fontSize = isMobile ? 16 : 20;
  const earned = props.isSushiswapPair
    ? `${props.sushiEarned} SUSHI`
    : `${props.ndxEarned} NDX`;
  const symbol = props.symbol.replace("UNIV2:", "").replace("SUSHI:", "");
  const actions = [
    <Statistic
      key="earned"
      title={tx("EARNED")}
      style={{ fontSize }}
      valueStyle={{ fontSize }}
      value={earned}
    />,
  ];

  usePoolDetailRegistrar(isNdx ? "" : props.address, tokenIds);

  if (props.hasStakingPool) {
    actions.push(
      <Statistic
        style={{ fontSize }}
        valueStyle={{ fontSize }}
        title={tx("STAKED")}
        value={props.staking ? `${props.staking} ${symbol}` : `0.00 ${symbol}`}
      />
    );
  }

  return (
    <FormattedLink
      link={props.link}
      isNdx={isNdx}
      isUniswapPair={props.isUniswapPair}
      isSushiswapPair={props.isSushiswapPair}
    >
      <Card
        hoverable={true}
        title={<Token size="medium" symbol={props.symbol} name={props.name} />}
        actions={actions}
        extra={
          <Quote
            address={props.address}
            price={convert.toCurrency(props.price)}
            inline={true}
          />
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Progress
            style={{
              marginTop: 12,
              fontSize: 24,
              textAlign: "center",
            }}
            width={90}
            status="active"
            type="dashboard"
            percent={parseFloat(props.weight.replace(/%/g, ""))}
          />

          <Space direction="vertical">
            <Typography.Text
              key="foo"
              style={{
                flex: 1,
                fontSize: isMobile ? 16 : 24,
                marginBottom: 0,
                textAlign: "right",
              }}
            >
              <Typography.Title
                type="secondary"
                style={{ fontSize: 12 }}
                level={5}
              >
                Balance
              </Typography.Title>
              <div style={{ fontSize: 16 }}>
                {convert.toComma(parseFloat(props.balance))}
              </div>
            </Typography.Text>

            <Typography.Text
              key="bar"
              type="success"
              style={{
                flex: 1,
                fontSize: isMobile ? 16 : 24,
                marginBottom: 0,
                textAlign: "right",
              }}
            >
              <Typography.Title
                type="secondary"
                style={{ fontSize: 12 }}
                level={5}
              >
                Currently worth
              </Typography.Title>
              <div>{props.value}</div>
            </Typography.Text>
          </Space>
        </div>
      </Card>
    </FormattedLink>
  );
}

function FormattedLink({
  link,
  isNdx,
  isUniswapPair,
  isSushiswapPair,
  children,
}: {
  children: ReactNode;
  link: string;
  isNdx: boolean;
  isUniswapPair: boolean;
  isSushiswapPair: boolean;
}) {
  if (isNdx || isUniswapPair || isSushiswapPair) {
    return (
      <ExternalLink to={link} withIcon={false} style={{ display: "block" }}>
        {children}
      </ExternalLink>
    );
  }

  return <Link to={link}>{children}</Link>;
}
