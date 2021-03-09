import { Button } from "components";
import { Divider, Steps, Typography } from "antd";
import { Link } from "react-router-dom";
import CategoryList from "./CategoryList";
import PoolList from "./PoolList";
import React, { useEffect, useState } from "react";
import flags from "feature-flags";
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
      <S.Title>Decentralized Trading Protocol</S.Title>
      <S.Subtitle level={5}>
        Guaranteed liquidity for millions of users and hundreds of Ethereum
        applications.
      </S.Subtitle>
      <S.Actions level={3}>
        <S.GetStarted>Get started today:</S.GetStarted>
        <Button.Group orientation="horizontal">
          <Link to="/pools">
            <Button type="ghost">View Index Pools</Button>
          </Link>
          <Link to="/docs">
            <Button type="default">Read the Documentation</Button>
          </Link>
          {flags.showFaqLink && (
            <Link to="/faq">
              <Button type="default">Check out the FAQ</Button>
            </Link>
          )}
        </Button.Group>
      </S.Actions>
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
    ${(props) => props.theme.snippets.fancy};
    font-size: 86px !important;
    max-width: 960px;
    line-height: 1.1;
    margin-bottom: 0 !important;
  `,
  Subtitle: styled(Typography.Title)`
    font-size: 1.5rem !important;
  `,
};
