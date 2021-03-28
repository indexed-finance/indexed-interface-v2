import { Badge, Divider, Space, Typography } from "antd";
import {
  IndexCard,
  ProviderRequirementDrawer,
  ScreenHeader,
  Token,
} from "components";
import { Link } from "react-router-dom";
import { Progress } from "components";
import { selectors, useNdxBalance } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";

export default function Portfolio() {
  const ndxBalance = useNdxBalance();
  const theme = useSelector(selectors.selectTheme);
  const { isMobile } = useBreakpoints();
  const __data = [
    {
      address: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
      image: "cc-dark-circular",
      link: "/pools/cryptocurrency-top-10-tokens-index",
      symbol: "CC10",
      name: "Cryptocurrency Top 10",
      balance: "20.00",
      staking: "2.00",
      value: "$200.00",
      weight: "50%",
    },
    {
      address: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf4",
      image: "defi-dark-circular",
      link: "/pools/defi-top-5-tokens-index",
      symbol: "DEFI5",
      name: "Decentralized Finance Top 5",
      balance: "20.00",
      staking: "2.00",
      value: "$200.00",
      weight: "50%",
    },
    {
      address: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf5",
      image: `indexed-${theme}`,
      symbol: "NDX",
      name: "Indexed",
      balance: ndxBalance,
      value: "$200.00",
      earned: "2.00",
    },
  ];

  return (
    <div>
      <ProviderRequirementDrawer includeSignerRequirement={true} />
      <ScreenHeader title="Portfolio" />
      <Space
        wrap={true}
        size="large"
        style={{ width: "100%", alignItems: "stretch" }}
      >
        {__data.map((datum) => {
          const card = (
            <IndexCard
              style={{ width: isMobile ? 300 : 500 }}
              direction={isMobile ? "vertical" : "horizontal"}
              key={datum.address}
              title={datum.name}
              subtitle={datum.symbol}
              actions={[
                {
                  title: "Balance (in tokens)",
                  value: datum.balance && `${datum.balance} ${datum.symbol}`,
                },
                {
                  title: "Value (in USD)",
                  value: (
                    <Typography.Text type="success">
                      {datum.value}
                    </Typography.Text>
                  ),
                },
              ]}
            >
              <Space style={{ paddingTop: 25 }} wrap={true}>
                {datum.weight && (
                  <Progress
                    status="active"
                    type="dashboard"
                    style={{ marginLeft: 20 }}
                    percent={parseFloat(datum.weight.replace(/%/g, ""))}
                  />
                )}
                {datum.earned && (
                  <Typography.Title level={2} className="no-margin-bottom">
                    Earned {datum.earned}{" "}
                    <Token
                      asAvatar={false}
                      name="NDX"
                      size="small"
                      image={datum.image}
                      style={{ position: "relative", top: -6, marginRight: 10 }}
                    />
                    NDX
                  </Typography.Title>
                )}
              </Space>
            </IndexCard>
          );
          const cardWithLink = datum.link ? (
            <Link to={datum.link}>{card}</Link>
          ) : (
            card
          );

          return datum.staking ? (
            <Badge.Ribbon
              key={datum.address}
              color="magenta"
              style={{ top: isMobile ? 80 : 0 }}
              text={
                datum.staking
                  ? `Staking ${datum.staking} ${datum.symbol}`
                  : `Earned ${datum.earned!} NDX`
              }
            >
              {cardWithLink}
            </Badge.Ribbon>
          ) : (
            cardWithLink
          );
        })}
      </Space>
      <Divider />
      <Typography.Title style={{ textAlign: "right" }}>
        Total Value: <Typography.Text type="success">$400.00</Typography.Text>
      </Typography.Title>
    </div>
  );
}
