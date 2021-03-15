import { Badge, Card, Divider, Progress, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { ProviderRequirementDrawer, ScreenHeader, Token } from "components";

const { Meta } = Card;

export default function Portfolio() {
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
      address: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
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
      address: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
      image: "indexed-dark",
      symbol: "NDX",
      name: "Indexed",
      balance: "20.00",
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
            <Card
              key={datum.address}
              bodyStyle={{ minWidth: 300, height: 193 }}
              hoverable={true}
              actions={[
                <div key="1">
                  <Typography.Text type="secondary">
                    Balance (in tokens)
                  </Typography.Text>
                  <Typography.Title
                    level={4}
                    style={{
                      margin: 0,
                    }}
                  >
                    {datum.balance && `${datum.balance} ${datum.symbol}`}
                  </Typography.Title>
                </div>,
                <div key="2">
                  <Typography.Text type="secondary">
                    Value (in USD)
                  </Typography.Text>
                  <Typography.Title
                    level={4}
                    type="success"
                    style={{
                      margin: 0,
                    }}
                  >
                    {datum.value}
                  </Typography.Title>
                </div>,
              ]}
            >
              <Space
                // className="spaced-between"
                style={{ paddingTop: 25 }}
                wrap={true}
              >
                <Meta
                  avatar={
                    <Token
                      size="small"
                      address={datum.address}
                      name={datum.symbol}
                      image={datum.image}
                    />
                  }
                  title={<>{datum.symbol}</>}
                  description={datum.name}
                />
                {datum.weight && (
                  <Progress
                    className="SmallProgress"
                    type="dashboard"
                    percent={parseFloat(datum.weight.replace(/%/g, ""))}
                  />
                )}
              </Space>
            </Card>
          );

          const cardWithLink = datum.link ? (
            <Link to={datum.link}>{card}</Link>
          ) : (
            card
          );

          return (
            <Badge.Ribbon
              color={datum.staking ? "purple" : "magenta"}
              text={
                datum.staking
                  ? `Staking ${datum.staking} ${datum.symbol}`
                  : `Earned ${datum.earned!} NDX`
              }
            >
              {cardWithLink}
            </Badge.Ribbon>
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
