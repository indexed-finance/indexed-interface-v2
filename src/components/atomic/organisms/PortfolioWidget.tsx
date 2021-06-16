import { AppState, FormattedPortfolioAsset, selectors } from "features";
import { ExternalLink } from "../atoms";
import { Link } from "react-router-dom";
import { Progress } from "components/atomic";
import { ReactNode } from "react";
import { Space, Statistic, Typography } from "antd";
import { Widget } from "./Widget";
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

  usePoolDetailRegistrar(isNdx ? "" : props.address, tokenIds);

  return (
    <FormattedLink
      link={props.link}
      isNdx={isNdx}
      isUniswapPair={props.isUniswapPair}
      isSushiswapPair={props.isSushiswapPair}
    >
      <Widget
        symbol={symbol}
        address={props.address}
        price={
          <Progress
            style={{
              fontSize: 24,
              textAlign: "right",
              position: "relative",
              top: 5,
            }}
            width={90}
            status="active"
            type="dashboard"
            percent={parseFloat(props.weight.replace(/%/g, ""))}
          />
        }
        badge={
          props.isUniswapPair
            ? "Uniswap V2"
            : props.isSushiswapPair
            ? "Sushiswap"
            : ""
        }
        badgeColor={
          props.isUniswapPair ? "pink" : props.isSushiswapPair ? "violet" : ""
        }
        stats={
          <Space direction="vertical">
            <Typography.Text
              type="success"
              style={{ flex: 1, fontSize: isMobile ? 16 : 24 }}
            >
              {props.value}
            </Typography.Text>
            {!isNdx && (
              <div data-tooltip="portfolio-widget-earned">
                <Statistic
                  title={tx("EARNED")}
                  style={{ fontSize }}
                  valueStyle={{ fontSize }}
                  value={earned}
                />
              </div>
            )}
            {props.hasStakingPool && (
              <Statistic
                style={{ fontSize }}
                valueStyle={{ fontSize }}
                title={tx("STAKED")}
                value={
                  props.staking
                    ? `${props.staking} ${symbol}`
                    : `0.00 ${symbol}`
                }
              />
            )}
            <Statistic
              title="Balance"
              style={{ fontSize }}
              valueStyle={{ fontSize }}
              value={`${props.balance} ${props.symbol}`}
            />
          </Space>
        }
      ></Widget>
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
