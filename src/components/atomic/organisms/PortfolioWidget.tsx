import { AppState, FormattedPortfolioAsset, selectors } from "features";
import { Button, Space, Statistic, Typography } from "antd";
import { Progress, Token } from "components/atomic";
import { Widget } from "./Widget";
import { useBreakpoints, usePoolDetailRegistrar, useTranslator } from "hooks";
import { useSelector } from "react-redux";

export function PortfolioWidget(props: FormattedPortfolioAsset) {
  const tx = useTranslator();
  const isNdx = props.symbol === "NDX";
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, props.address)
  );
  const { isMobile } = useBreakpoints();
  console.log(props.price);

  usePoolDetailRegistrar(isNdx ? "" : props.address, tokenIds);

  if (isNdx) {
    console.log(`NDX BAL ${props.balance} | PRICE ${props.price}`);
  }

  return (
    <Widget
      symbol={props.symbol}
      address={props.address}
      price={props.price}
      stats={
        <Space direction="vertical">
          <div data-tooltip="portfolio-widget-earned">
            <Statistic
              title={tx("EARNED")}
              style={{ fontSize: isMobile ? 16 : 20 }}
              valueStyle={{ fontSize: isMobile ? 16 : 20 }}
              value={`${props.ndxEarned} NDX`}
            />
          </div>
          {props.hasStakingPool ? (
            <Statistic
              style={{ fontSize: isMobile ? 16 : 20 }}
              valueStyle={{ fontSize: isMobile ? 16 : 20 }}
              title={tx("STAKED")}
              value={
                props.staking
                  ? `${props.staking} ${props.symbol}`
                  : `0.00 ${props.symbol}`
              }
            />
          ) : (
            <Statistic
              style={{ visibility: "hidden" }}
              title="Foo"
              value="Bar"
            />
          )}
        </Space>
      }
      actions={
        isNdx ? null : (
          <Button type="primary" onClick={(event) => event.stopPropagation()}>
            {props.balance}
          </Button>
        )
      }
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space direction="vertical" style={{ marginRight: 24 }}>
          <Token
            name={props.name}
            symbol={props.symbol}
            amount={props.balance}
            size="small"
          />
          <Typography.Text
            type="success"
            style={{ flex: 1, fontSize: isMobile ? 16 : 24 }}
          >
            {props.value}
          </Typography.Text>
        </Space>
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
      </div>
    </Widget>
  );
}
