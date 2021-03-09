import { Area, Button, ScreenHeader } from "components";
import {
  Avatar,
  Col,
  Divider,
  Grid,
  List,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { FaTractor } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Subscreen } from "../subscreens";
import React from "react";
import styled from "styled-components";

const { useBreakpoint } = Grid;

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
  const breakpoints = useBreakpoint();
  const area = (
    <S.Area direction="vertical">
      <Typography.Title>Liquidity mining</Typography.Title>
      <Typography.Paragraph>
        Stake index tokens or their associated Uniswap liquidity tokens to earn
        NDX, the governance token for Indexed Finance.
      </Typography.Paragraph>
    </S.Area>
  );
  const pools = (
    <Subscreen icon={null} title="Available Pools">
      <S.List>
        {__data.map((datum) => (
          <React.Fragment key={datum.id}>
            <List.Item
              extra={
                <Space split={<Divider />}>
                  <Statistic title="APY" value={datum.apy} />
                  <Space direction="vertical">
                    <Statistic title="Staked" value={datum.staked} />
                    <S.Button type="primary" icon={<FaTractor />}>
                      Stake pool
                    </S.Button>
                  </Space>
                </Space>
              }
            >
              <List.Item.Meta
                title={
                  <Link to={`/pools/${datum.slug}`}>
                    <S.Avatar src={datum.image} />
                    {datum.name} [{datum.symbol}]
                  </Link>
                }
                description={
                  <Typography.Text type="secondary">
                    Rate: {datum.rate} <br /> Total: {datum.total}
                  </Typography.Text>
                }
              />
            </List.Item>
          </React.Fragment>
        ))}
      </S.List>
    </Subscreen>
  );

  // Variants
  const mobileSized = (
    <Row gutter={5}>
      <Col span={24}>{area}</Col>
      <Col span={24}>{pools}</Col>
    </Row>
  );
  const desktopSized = (
    <>
      <Row gutter={20}>
        <Col span={12}>{area}</Col>
      </Row>
      <Row gutter={20}>
        <Col span={12}>{pools}</Col>
      </Row>
    </>
  );

  return (
    <>
      <ScreenHeader title="Stake" />
      {(() => {
        switch (true) {
          case breakpoints.sm:
            return desktopSized;
          case breakpoints.xs:
            return mobileSized;
        }
      })()}
    </>
  );
}

const S = {
  List: styled(List)`
    .ant-space {
      flex: 1;
      align-items: flex-start;
    }
    .ant-list-item {
      align-items: flex-start;
    }
  `,
  Button: styled(Button)`
    ${(props) => props.theme.snippets.fancy};

    svg {
      margin-right: ${(props) => props.theme.spacing.small};
    }
  `,
  Description: styled(Typography.Paragraph)`
    padding: ${(props) => props.theme.spacing.medium};
  `,
  Divider: styled(Divider)`
    ${(props) => props.theme.snippets.fancy};
  `,
  Area: styled(Area)`
    margin-bottom: ${(props) => props.theme.spacing.large};
  `,
  Avatar: styled(Avatar)`
    margin-right: ${(props) => props.theme.spacing.small};
  `,
};
