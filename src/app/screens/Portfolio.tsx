import {
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { IoLogoUsd } from "react-icons/io";
import { Link } from "react-router-dom";
import {
  Logo,
  ProviderRequirementDrawer,
  ScreenHeader,
  Token,
} from "components";
import { Subscreen } from "../subscreens";
import { useBreakpoints } from "helpers";
import React from "react";

const { Item } = List;

export default function Portfolio() {
  const __data = [
    {
      address: "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
      image: "cc-dark-circular",
      link: "/pools/0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
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
      link: "/pools/0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41",
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
    <Subscreen icon={<IoLogoUsd />} title="NDX">
      <Space size="large" split={<Logo withTitle={false} />}>
        <Statistic title="Balance" value="2800.00 NDX" />
        <Statistic title="Earned" value="0.00 NDX" />
      </Space>
    </Subscreen>
  );
  const holdings = (
    <Subscreen icon={<IoLogoUsd />} title="Holdings">
      <List
        size="small"
        footer={
          <>
            <Divider />
            <div>
              <Typography.Title type="secondary" level={3}>
                Total Value
              </Typography.Title>
              <Typography.Title type="success" level={2}>
                $400.00
              </Typography.Title>
            </div>
          </>
        }
      >
        {__data.map((entry) => (
          <>
            <Item key={entry.symbol}>
              <div>
                <Space direction="vertical" size="small">
                  <Typography.Title level={4}>
                    <div>
                      <Token
                        size="small"
                        address={entry.address}
                        name={entry.symbol}
                        image={entry.image}
                      />
                      {entry.symbol}
                    </div>
                  </Typography.Title>
                  <Typography.Title level={5}>
                    <Link to={entry.link}>{entry.name}</Link>
                  </Typography.Title>
                </Space>

                <Space direction="vertical">
                  <em>
                    <Typography.Text>
                      Staking {entry.staking} {entry.symbol}
                    </Typography.Text>
                  </em>
                  <Typography.Title level={3}>
                    {entry.balance} {entry.symbol}
                    <br />
                    {entry.value}
                  </Typography.Title>
                </Space>
                <Progress
                  type="dashboard"
                  percent={parseFloat(entry.weight.replace(/%/g, ""))}
                />
              </div>
            </Item>
          </>
        ))}
      </List>
    </Subscreen>
  );

  // Variants
  const mobileSized = (
    <Row gutter={5}>
      <Col span={24}>{holdings}</Col>
      <Col span={24}>{ndx}</Col>
    </Row>
  );
  const smallSized = (
    <>
      <Row gutter={20}>
        <Col span={10}>{holdings}</Col>
      </Row>
      <Row gutter={20}>
        <Col span={10}>{ndx}</Col>
      </Row>
    </>
  );

  return (
    <div>
      <ProviderRequirementDrawer
        includeSignerRequirement={true}
        placement="right"
      />
      <ScreenHeader title="Portfolio" />
      {(() => {
        switch (true) {
          // case breakpoints.xxl:
          //   return desktopSized;
          // case breakpoints.xl:
          //   return tabletSized;
          // case breakpoints.lg:
          //   return tabletSized;
          // case breakpoints.md:
          //   return tabletSized;
          case breakpoints.sm:
            return smallSized;
          case breakpoints.xs:
            return mobileSized;
        }
      })()}
    </div>
  );
}
