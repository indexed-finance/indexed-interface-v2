import { Button, Divider, Steps, Typography } from "antd";
import { FEATURE_FLAGS } from "feature-flags";
import { Link } from "react-router-dom";
import { useBreakpoints, useTranslator } from "hooks";
import { useEffect, useState } from "react";
import CategoryList from "./CategoryList";
import PoolList from "./PoolList";

const { Step } = Steps;
const STEP_COUNT = 3;
const STEP_PROGRESSION_DURATION = 7500;

export default function Splash() {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();
  const [step, setStep] = useState(0);
  const docsButton = (
    <Button type="default">{tx("READ_THE_DOCUMENTATION")}</Button>
  );
  const DocsButton = () =>
    FEATURE_FLAGS.useInternalDocs ? (
      <Link to="/docs">{docsButton}</Link>
    ) : (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://docs.indexed.finance/"
      >
        {docsButton}
      </a>
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
    <div style={{ textAlign: "center" }}>
      <Typography.Title style={{ fontSize: isMobile ? 40 : 64 }}>
        {tx("DECENTRALIZED_INDEX_PROTOCOL")}
      </Typography.Title>
      <Typography.Title level={isMobile ? 5 : 3}>
        {tx("PASSIVELY_MANAGED_...")}
      </Typography.Title>
      <Typography.Title level={3}>
        <div style={{ marginBottom: 10 }}>{tx("GET_STARTED_TODAY")}</div>
        <Button.Group style={{ flexDirection: isMobile ? "column" : "row" }}>
          <Link to="/pools">
            <Button
              type="primary"
              style={{
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
              <Button type="default">{tx("FREQUENTLY_ASKED_QUESTIONS")}</Button>
            </Link>
          )}
        </Button.Group>
      </Typography.Title>
      {FEATURE_FLAGS.useHomepageSteps && (
        <>
          <Divider />
          <Steps current={step} responsive={true} type="navigation">
            <Step
              title="Foo"
              subTitle="First thing"
              description="Lorem ipsum dolor sit amet"
            />
            <Step
              title="Bar"
              subTitle="First thing"
              description="Lorem ipsum dolor sit amet"
            />
            <Step
              title="Baz"
              subTitle="First thing"
              description="Lorem ipsum dolor sit amet"
            />
          </Steps>
          <Divider />
        </>
      )}
      <PoolList withBreadcrumb={false} />
      <Divider />
      <CategoryList withBreadcrumb={false} />
    </div>
  );
}
