import {
  Col,
  Divider,
  Empty,
  Grid,
  Input,
  Row,
  Space,
  Statistic,
  Switch,
  Typography,
} from "antd";
import { FaEthereum } from "react-icons/fa";
import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

export type InitializeKind = "individual" | "delegate";

const { useBreakpoint } = Grid;

export default function Govern() {
  const breakpoints = useBreakpoint();
  const [initializeKind, setInitializeKind] = useState<InitializeKind>(
    "individual"
  );
  const toggleKind = useCallback(
    () =>
      setInitializeKind((prev) =>
        prev === "individual" ? "delegate" : "individual"
      ),
    []
  );
  const [isActive, setIsActive] = useState(false);
  const status = useMemo(
    () =>
      isActive ? (
        <Subscreen
          icon={null}
          title={
            <>
              Status: <Typography.Text type="success">Active</Typography.Text>
            </>
          }
          defaultActions={[
            {
              title: "Delegate",
              onClick: () => {
                /* */
              },
              type: "primary",
            },
          ]}
        >
          <Statistic title="Balance" value="2800.00 NDX" />
          <Divider />
          <Typography.Title level={3}>Delegate your votes</Typography.Title>
          <Typography.Paragraph>
            Allow someone to vote on your behalf.
          </Typography.Paragraph>
          <S.Input
            type="text"
            placeholder="Enter delegation address"
            size="large"
            addonBefore={<FaEthereum />}
          />
        </Subscreen>
      ) : (
        <Subscreen
          icon={null}
          title={
            <>
              Status: <Typography.Text type="warning">Inactive</Typography.Text>
            </>
          }
          defaultActions={[
            {
              title: "Initialize",
              onClick: () => {
                setIsActive(true);
              },
              type: "primary",
            },
          ]}
        >
          <S.Centered>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            <S.Heading level={3}>
              <Typography.Text type="warning">
                Initialize wallet to vote
              </Typography.Text>
            </S.Heading>
            <Divider>Select one</Divider>
            <Space size="large" align="start">
              <div>
                <S.Switch
                  checked={initializeKind === "individual"}
                  onClick={toggleKind}
                />
                <S.Heading level={4}>Individual</S.Heading>
                <Typography.Paragraph>
                  Vote for your own future.
                </Typography.Paragraph>
              </div>
              <div>
                <S.Switch
                  checked={initializeKind === "delegate"}
                  onClick={toggleKind}
                />
                <S.Heading level={4}>Delegate</S.Heading>
                <Typography.Paragraph>
                  Allow someone else to vote on your behalf.
                </Typography.Paragraph>
              </div>
            </Space>
          </S.Centered>
          {initializeKind === "delegate" && (
            <>
              <Divider>Delegate to</Divider>
              <S.Input
                type="text"
                placeholder="Enter delegation address"
                size="large"
                addonBefore={<FaEthereum />}
              />
            </>
          )}
        </Subscreen>
      ),
    [initializeKind, toggleKind, isActive]
  );
  const proposals = (
    <Subscreen icon={null} title="Proposals">
      Proposals
    </Subscreen>
  );
  const chart = (
    <Subscreen icon={null} title="Chart">
      Chart
    </Subscreen>
  );

  // Variants
  const mobileSized = (
    <Row gutter={5}>
      <Col span={24}>{status}</Col>
      <Col span={24}>{proposals}</Col>
      <Col span={24}>{chart}</Col>
    </Row>
  );
  const desktopSized = (
    <>
      <Row gutter={20}>
        <Col span={8}>{status}</Col>
        <Col span={10} push={6}>
          {proposals}
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={24}>{chart}</Col>
      </Row>
    </>
  );

  return (
    <>
      <ScreenHeader title="Govern" />
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
  Input: styled(Input)`
    margin-bottom: ${(props) => props.theme.spacing.large};
  `,
  Centered: styled.div`
    text-align: center;
  `,
  Heading: styled(Typography.Title)`
    ${(props) => props.theme.snippets.fancy};
  `,
  Switch: styled(Switch)`
    margin-bottom: ${(props) => props.theme.spacing.medium};
  `,
};
