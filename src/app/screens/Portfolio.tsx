import {
  Col,
  Divider,
  Grid,
  List,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { IoLogoUsd } from "react-icons/io";
import { Link } from "react-router-dom";
import { Logo, ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";
import styled from "styled-components";

const { useBreakpoint } = Grid;
const { Item } = List;

export default function Portfolio() {
  const __data = [
    {
      image: require("assets/images/cc-dark-circular.png").default,
      link: "/pools/0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3",
      symbol: "CC10",
      name: "Cryptocurrency Top 10",
      balance: "20.00",
      staking: "2.00",
      value: "$200.00",
      weight: "50%",
    },
    {
      image: require("assets/images/defi-dark-circular.png").default,
      link: "/pools/0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41",
      symbol: "DEFI5",
      name: "Decentralized Finance Top 5",
      balance: "20.00",
      staking: "2.00",
      value: "$200.00",
      weight: "50%",
    },
  ];

  const breakpoints = useBreakpoint();
  const ndx = (
    <Subscreen icon={<IoLogoUsd />} title="NDX">
      <S.Centered size="large" split={<Logo withTitle={false} />}>
        <S.StatisticLeft title="Balance" value="2800.00 NDX" />
        <S.StatisticRight title="Earned" value="0.00 NDX" />
      </S.Centered>
    </Subscreen>
  );
  const holdings = (
    <Subscreen icon={<IoLogoUsd />} title="Holdings">
      <List
        size="small"
        footer={
          <>
            <Divider />
            <S.Totals level={2}>
              <S.StatisticRight title="Portfolio Total Value" value="$20.00" />
            </S.Totals>
          </>
        }
      >
        {__data.map((entry) => (
          <Item key={entry.symbol}>
            <S.Left>
              <S.Weight level={2}>{entry.weight}</S.Weight>
              <Space direction="vertical" size="small">
                <S.Title level={4}>
                  <S.Aligned>
                    <S.Image alt={entry.symbol} src={entry.image} />{" "}
                    {entry.symbol}
                  </S.Aligned>
                </S.Title>
                <S.Title level={5}>
                  <Link to={entry.link}>{entry.name}</Link>
                </S.Title>
              </Space>
              <S.Number direction="vertical">
                <S.Staking>
                  Staking {entry.staking} {entry.symbol}
                </S.Staking>
                <S.Title level={3}>
                  {entry.balance} {entry.symbol}
                  <br />
                  {entry.value}
                </S.Title>
              </S.Number>
            </S.Left>
          </Item>
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
    <>
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
    </>
  );
}

const S = {
  Totals: styled(Typography.Title)`
    ${(props) => props.theme.snippets.spacedBetween};
    flex-direction: row-reverse;
  `,
  Title: styled(Typography.Title)`
    margin-bottom: 0 !important;
  `,
  Number: styled(Space)`
    text-align: right;
    flex: 1;
  `,
  Weight: styled(Typography.Title)`
    margin-right: ${(props) => props.theme.spacing.medium} !important;
    margin-bottom: 0 !important;
  `,
  Left: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
    align-items: flex-end;
    flex: 1;

    .ant-space-item {
      margin-bottom: 0 !important;
    }
  `,
  Image: styled.img`
    ${(props) => props.theme.snippets.size20};
    margin-right: ${(props) => props.theme.spacing.medium};
  `,
  Aligned: styled.div`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  Label: styled(Typography.Title)`
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    ${(props) => props.theme.snippets.fancy};
  `,
  Staking: styled(Typography.Text)`
    font-style: italic;
  `,
  Centered: styled(Space)`
    text-align: center;
  `,
  StatisticLeft: styled(Statistic)`
    text-align: left;
  `,
  StatisticRight: styled(Statistic)`
    text-align: right;
  `,
};
