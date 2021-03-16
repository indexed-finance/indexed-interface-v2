import { Button, Space, Statistic, Typography } from "antd";
import { IndexCard, ScreenHeader } from "components";
import { Link } from "react-router-dom";
import { useBreakpoints } from "helpers";

export default function Stake() {
  const stakeable = {
    image: require("assets/images/cc-dark-circular.png").default,
    id: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
    slug: "cryptocurrency-top-10-tokens-index",
    name: "Cryptocurrency Top 10",
    symbol: "CC10",
    staked: "0.00 CC10",
    apy: "13.37%",
    rate: "1666.66 NDX/Day",
    total: "50,000 NDX",
  };
  const __data = [stakeable, stakeable, stakeable];
  const breakpoints = useBreakpoints();

  return (
    <>
      <ScreenHeader title="Stake" />
      <Typography.Title>Liquidity mining</Typography.Title>
      <Typography.Paragraph>
        Stake index tokens or their associated Uniswap liquidity tokens to earn
        NDX, the governance token for Indexed Finance.
      </Typography.Paragraph>
      <Space
        wrap={true}
        size="large"
        style={{
          marginTop: 15,
          width: "100%",
          justifyContent: breakpoints.isMobile ? "center" : "flex-start",
        }}
      >
        {__data.map((datum) => {
          const commonActions = [
            {
              title: "Rate",
              value: datum.rate,
            },
            {
              title: "Total",
              value: datum.total,
            },
          ];
          const actions = breakpoints.isMobile
            ? [
                {
                  title: "APY",
                  value: datum.apy,
                },
                {
                  title: "Staked",
                  value: datum.staked,
                },
                ...commonActions,
              ]
            : commonActions;

          return (
            <IndexCard
              style={{
                marginBottom: 15,
                width: "100%",
              }}
              direction={breakpoints.isMobile ? "vertical" : "horizontal"}
              title={<Link to={`/pools/${datum.slug}`}>{datum.name}</Link>}
              subtitle={datum.symbol}
              actions={actions}
              centered={false}
            >
              <Space
                direction="vertical"
                style={{ textAlign: "center", justifyContent: "center" }}
              >
                {!breakpoints.isMobile && (
                  <Space style={{ width: "100%" }}>
                    <Statistic title="APY" value={datum.apy} />
                    <Statistic title="Staked" value={datum.staked} />
                  </Space>
                )}
                <Button
                  type="primary"
                  style={{ minWidth: 200, justifySelf: "center" }}
                >
                  Stake pool
                </Button>
              </Space>
            </IndexCard>
          );
        })}
      </Space>
    </>
  );
}
