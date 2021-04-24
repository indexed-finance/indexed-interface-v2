import { Button, Divider, Steps, Typography } from "antd";
import { ExternalLink } from "components/atomic";
import { FEATURE_FLAGS } from "feature-flags";
import { Link } from "react-router-dom";
import { useBreakpoints, useTranslator } from "hooks";
import { useEffect, useState } from "react";
import IndexPools from "./IndexPools";

const { Step } = Steps;
const STEP_COUNT = 3;
const STEP_PROGRESSION_DURATION = 7500;

export default function Splash() {
  const tx = useTranslator();
  const [step, setStep] = useState(0);
  const { isMobile } = useBreakpoints();
  const docsButton = (
    <Button
      type="default"
      style={{ fontSize: 24, height: "auto", textTransform: "uppercase" }}
    >
      {tx("READ_THE_DOCUMENTATION")}
    </Button>
  );
  const DocsButton = () =>
    FEATURE_FLAGS.useInternalDocs ? (
      <Link to="/docs">{docsButton}</Link>
    ) : (
      <ExternalLink to="https://docs.indexed.finance/">
        {docsButton}
      </ExternalLink>
    );

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
    <>
      <div style={{ textAlign: "center" }}>
        <Typography.Title style={{ fontSize: isMobile ? 40 : 64 }}>
          {tx("DECENTRALIZED_INDEX_PROTOCOL")}
        </Typography.Title>
        <Typography.Title level={2}>
          {tx("PASSIVELY_MANAGED_...")}
        </Typography.Title>
        <Typography.Title level={3}>
          <div style={{ marginBottom: 25 }}>{tx("GET_STARTED_TODAY")}</div>
          <Button.Group style={{ flexDirection: isMobile ? "column" : "row" }}>
            <Link to="/index-pools">
              <Button
                type="primary"
                style={{
                  textTransform: "uppercase",
                  fontSize: 24,
                  height: "auto",
                  marginRight: isMobile ? 0 : 10,
                  marginBottom: isMobile ? 10 : 0,
                }}
              >
                {tx("VIEW_INDEX_POOLS")}
              </Button>
            </Link>
            <DocsButton />
            {FEATURE_FLAGS.useFaqLink && (
              <Link to="/faq">
                <Button type="default" style={{ fontSize: 24 }}>
                  {tx("FREQUENTLY_ASKED_QUESTIONS")}
                </Button>
              </Link>
            )}
          </Button.Group>
        </Typography.Title>
      </div>
      <div style={{ padding: "3rem 0" }}>
        <Steps current={step} responsive={true} type="navigation">
          <Step title="Foo" description="Lorem ipsum dolor sit amet" />
          <Step title="Bar" description="Lorem ipsum dolor sit amet" />
          <Step title="Baz" description="Lorem ipsum dolor sit amet" />
        </Steps>
      </div>
      <Divider orientation="left" style={{ marginBottom: 24 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Index Pools
        </Typography.Title>
      </Divider>
      <IndexPools />
    </>
  );
}
