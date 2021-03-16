import { Button, Divider, Steps, Typography } from "antd";
import { Link } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useEffect, useState } from "react";
import CategoryList from "./CategoryList";
import PoolList from "./PoolList";
import flags from "feature-flags";

const { Step } = Steps;
const STEP_COUNT = 3;
const STEP_PROGRESSION_DURATION = 2500;

export default function Splash() {
  const { isMobile } = useBreakpoints();
  const [step, setStep] = useState(0);
  const docsButton = <Button type="default">Read the Documentation</Button>;
  const DocsButton = () =>
    flags.useInternalDocs ? (
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
        Decentralized Index Protocol
      </Typography.Title>
      <Typography.Title level={isMobile ? 5 : 3}>
        Passively managed, autonomous AMM pools powering the future of finance.
      </Typography.Title>
      <Typography.Title level={3}>
        <div style={{ marginBottom: 10 }}>Get started today</div>
        <Button.Group style={{ flexDirection: isMobile ? "column" : "row" }}>
          <Link to="/pools">
            <Button
              type="primary"
              style={{
                marginRight: isMobile ? 0 : 10,
                marginBottom: isMobile ? 10 : 0,
              }}
            >
              View Index Pools
            </Button>
          </Link>
          <DocsButton />
          {flags.showFaqLink && (
            <Link to="/faq">
              <Button type="default">Check out the FAQ</Button>
            </Link>
          )}
        </Button.Group>
      </Typography.Title>
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
      <PoolList withBreadcrumb={false} />
      <Divider />
      <CategoryList withBreadcrumb={false} />
    </div>
  );
}
