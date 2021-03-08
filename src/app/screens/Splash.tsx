import { Area, Button } from "components";
import { Divider, Steps, Typography } from "antd";
import CategoryList from "./CategoryList";
import PoolList from "./PoolList";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const { Step } = Steps;
const STEP_COUNT = 3;
const STEP_PROGRESSION_DURATION = 2500;

export default function Splash() {
  const [step, setStep] = useState(0);

  // Effect:
  // Continuously progress through the steps on the splash page.
  useEffect(() => {
    let progressingThroughSteps: NodeJS.Timeout;

    const progress = () => {
      setStep((prevStep) => {
        let nextStep = prevStep + 1;

        if (nextStep >= STEP_COUNT) {
          nextStep = 0;
        }

        return nextStep;
      });

      progressingThroughSteps = setTimeout(progress, STEP_PROGRESSION_DURATION);
    };

    progress();

    return () => {
      clearTimeout(progressingThroughSteps);
    };
  }, []);

  return (
    <S.Splash>
      <S.Title>
        <div>Decentralized Trading Protocol</div>
        <Typography.Title level={5}>
          Guaranteed liquidity for millions of users and hundreds of Ethereum
          applications.
        </Typography.Title>
      </S.Title>
      <Area>
        <S.Actions level={3}>
          <S.GetStarted>Get started today:</S.GetStarted>
          <Button.Group orientation="horizontal">
            <Button type="ghost">View Index Pools</Button>
            <Button type="default">Read the Documentation</Button>
            <Button type="default">Check out the FAQ</Button>
          </Button.Group>
        </S.Actions>
      </Area>
      <S.Steps progressDot current={step}>
        <Step title="1. Foo" subTitle="First thing" />
        <Step title="2. Bar" subTitle="First thing" />
        <Step title="3. Baz" subTitle="First thing" />
      </S.Steps>
      <Divider />
      <PoolList withBreadcrumb={false} centered={true} />
      <Divider />
      <CategoryList withBreadcrumb={false} centered={true} />
    </S.Splash>
  );
}

const S = {
  Actions: styled(Typography.Title)`
    ${(props) => props.theme.snippets.perfectlyAligned};
  `,
  GetStarted: styled.span`
    margin-right: ${(props) => props.theme.spacing.large};
  `,
  Splash: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  `,
  Steps: styled(Steps)`
    margin-top: ${(props) => props.theme.spacing.huge};
    max-width: 960px;
  `,
  Title: styled(Typography.Title)`
    div {
      ${(props) => props.theme.snippets.fancy};
      font-size: 86px;
      max-width: 960px;
      line-height: 1.1;
    }
    h5 {
      font-size: 1.5rem;
      /* margin-bottom: ${(props) => props.theme.spacing.huge}; */
    }
  `,
};
