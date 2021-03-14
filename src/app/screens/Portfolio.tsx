import {
  Badge,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { ProviderRequirementDrawer, ScreenHeader, Token } from "components";
import { Subscreen } from "../subscreens";
import { useBreakpoints } from "helpers";

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
  ];
  const breakpoints = useBreakpoints();
  const ndx = (
    <Subscreen title="NDX" className="NDXSubscreen">
      <Space size="large" style={{ width: "100%" }} align="start">
        <Statistic title="Balance" value="2800.00 NDX" />
        <Statistic
          title="Earned"
          value="0.00 NDX"
          style={{ textAlign: "right" }}
        />
      </Space>
    </Subscreen>
  );
  const holdings = (
    <Subscreen title="Holdings" className="HoldingsSubscreen">
      <Space wrap={true} size="large">
        {__data.map((datum) => {
          const card = (
            <Link to={datum.link}>
              <Card
                key={datum.address}
                style={{ width: 400 }}
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
                <Space className="spaced-between" style={{ paddingTop: 25 }}>
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
                  <Progress
                    className="SmallProgress"
                    type="dashboard"
                    percent={parseFloat(datum.weight.replace(/%/g, ""))}
                  />
                </Space>
              </Card>
            </Link>
          );

          return datum.staking ? (
            <Badge.Ribbon
              text={`Staking ${datum.staking} ${datum.symbol}`}
              color="blue"
            >
              {card}
            </Badge.Ribbon>
          ) : (
            card
          );
        })}
      </Space>
      <Divider />
      <Typography.Title style={{ textAlign: "right" }}>
        Total Value: <Typography.Text type="success">$400.00</Typography.Text>
      </Typography.Title>
    </Subscreen>
  );

  // Variants
  const mobileSized = (
    <Row gutter={5}>
      <Col span={24}>{ndx}</Col>
      <Col span={24}>{holdings}</Col>
    </Row>
  );
  const smallSized = (
    <Row gutter={10}>
      <Col span={10}>{ndx}</Col>
      <Col span={24}>{holdings}</Col>
    </Row>
  );

  return (
    <div>
      <ProviderRequirementDrawer includeSignerRequirement={true} />
      <ScreenHeader title="Portfolio" />
      {(() => {
        switch (true) {
          case breakpoints.sm:
            return smallSized;
          case breakpoints.xs:
            return mobileSized;
        }
      })()}
    </div>
  );
}
