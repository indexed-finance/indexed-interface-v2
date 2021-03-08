import { Divider, Steps, Typography } from "antd";
import CategoryList from "./CategoryList";
import PoolList from "./PoolList";
import React from "react";
import styled from "styled-components";

const { Step } = Steps;

export default function Splash() {
  return (
    <S.Splash>
      <Typography.Title>Lorem ipsum</Typography.Title>
      <Typography.Title level={2}>dolor sit amet consecitur</Typography.Title>
      <S.Steps progressDot current={1}>
        <Step title="1. Foo" subTitle="First thing" />
        <Step title="2. Bar" subTitle="First thing" />
        <Step title="3. Baz" subTitle="First thing" />
      </S.Steps>
      <PoolList withBreadcrumb={false} centered={true} />
      <Divider />
      <CategoryList withBreadcrumb={false} centered={true} />
    </S.Splash>
  );
}

const S = {
  Splash: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  `,
  Steps: styled(Steps)`
    max-width: 700px;
  `,
};
