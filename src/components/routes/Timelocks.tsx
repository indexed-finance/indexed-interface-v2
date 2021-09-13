import { Alert, Button, Card, Col, Row, Slider, Space, Typography } from "antd";
import { Formik } from "formik";
import { Label, Page, Progress, TokenSelector } from "components/atomic";
import { ReactNode, useState } from "react";
import {
  calculateBonusMultiplier,
  calculateEarlyWithdrawalFeePercent,
  convert,
} from "helpers";
import { formatDistance } from "date-fns";

export default function Timelocks() {
  return (
    <Page title="Timelocks" hasPageHeader={true}>
      <Space direction="vertical" size="large">
        <CreateTimelockForm />

        <Row>
          <Col span={8}>
            <TimelockCard
              dndxAmount={58.24}
              baseNdxAmount={14.56}
              duration={31104000}
              dividends={12.04}
              timeLeft={0}
              unlocksAt={1631303807596 / 1000}
            />
          </Col>
          <Col span={8}>
            <TimelockCard
              dndxAmount={58.24}
              baseNdxAmount={14.56}
              duration={31104000}
              dividends={12.04}
              timeLeft={1037000}
              unlocksAt={1631303807596 / 1000}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}

const duration = (s: number) =>
  formatDistance(0, s * 1000, { includeSeconds: true });

interface Props {
  dndxAmount: number;
  baseNdxAmount: number;
  duration: number;
  dividends: number;
  timeLeft: number;
  unlocksAt: number;
}

function TimelockCard(props: Props) {
  const bonusMultiplier = calculateBonusMultiplier(props.duration);
  const formattedDuration = duration(props.duration);
  const formattedTimeLeft = duration(props.timeLeft);
  const percentage = (1 - props.timeLeft / props.duration) * 100;
  const isReady = props.timeLeft <= 0;
  const earlyWithdrawalFeePercent = calculateEarlyWithdrawalFeePercent(
    props.unlocksAt,
    props.duration
  );

  return (
    <Card
      actions={[
        <Progress
          key="percent"
          showInfo={false}
          status={isReady ? "success" : "exception"}
          percent={percentage}
          style={{ paddingLeft: 8, paddingRight: 8 }}
        />,
      ]}
      title={
        <Typography.Title level={3} type="success">
          {props.dndxAmount} dNDX
        </Typography.Title>
      }
    >
      <Alert
        type="info"
        style={{ borderRadius: 0, marginBottom: 18 }}
        message={
          <>
            Deposit of {props.baseNdxAmount} NDX for {formattedDuration} with a{" "}
            {bonusMultiplier.displayed}x bonus.
          </>
        }
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div key="dividends">
          <Label style={{ color: "#00AEAF" }}>Dividends</Label>
          <Space
            size="large"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Typography.Title style={{ margin: 0 }} level={3}>
              {props.dividends} WETH
            </Typography.Title>
            <Button>Claim</Button>
          </Space>
        </div>

        <div key="timeLeft">
          {isReady ? (
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Typography.Title style={{ margin: 0 }} level={3} type="success">
                Ready
              </Typography.Title>
              <Button type="primary">Withdraw</Button>
            </Space>
          ) : (
            <>
              <Label style={{ color: "#00AEAF" }}>Unlocks In</Label>
              <Space
                size="large"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Typography.Title style={{ margin: 0 }} level={3}>
                  {formattedTimeLeft}
                </Typography.Title>
                <Button type="primary" danger={!isReady}>
                  Withdraw
                </Button>
              </Space>
              <Alert
                style={{ marginTop: 12 }}
                type="error"
                message={`Withdrawing this timelock early will result in a fee of ${earlyWithdrawalFeePercent}%`}
              />
            </>
          )}
        </div>
      </Space>
    </Card>
  );
}

function TimelockField({
  title,
  description = "",
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card
      style={{ background: "#232323", marginBottom: 24 }}
      hoverable={false}
      bordered={false}
      title={
        <>
          <Typography.Title
            level={2}
            type="warning"
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.2ch",
            }}
          >
            {title}
          </Typography.Title>
          {description && (
            <Typography.Title level={4} style={{ margin: 0 }}>
              {description}
            </Typography.Title>
          )}
        </>
      }
    >
      {children}
    </Card>
  );
}

function TimelockDurationSlider() {
  const MINIMUM = 7776000;
  const MAXIMUM = 31104000;
  const [value, setValue] = useState(MINIMUM);

  return (
    <Slider min={MINIMUM} max={MAXIMUM} value={value} onChange={setValue} />
  );
}

function CreateTimelockForm() {
  return (
    <Formik
      initialValues={{
        amount: {
          displayed: "0.00",
          exact: convert.toBigNumber("0.00"),
        },
        duration: 0,
      }}
      onSubmit={console.info}
    >
      <Row>
        <Col span={18}>
          <TimelockField
            title="Amount"
            description={
              <>
                How much NDX will be locked up?{" "}
                <small>
                  <br />
                  <em>
                    Remember, NDX locked in a timelock can still be used to
                    vote.
                  </em>
                </small>
              </>
            }
          >
            <TokenSelector
              loading={false}
              assets={[]}
              value={{
                token: "NDX",
                amount: {
                  displayed: "0.00",
                  exact: convert.toBigNumber("0"),
                },
              }}
              selectable={false}
              onChange={(newValues) => {
                /** Pass */
              }}
            />
          </TimelockField>
          <TimelockField
            title="Duration"
            description="Adjust how long the timelock takes to mature."
          >
            <Row align="middle" gutter={36}>
              <Col span={16}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    90 days, <br />
                    1.0x
                  </div>

                  <div style={{ flex: 3 }}>
                    <TimelockDurationSlider />
                  </div>

                  <div style={{ flex: 1, textAlign: "right" }}>
                    360 days, <br />
                    3.0x
                  </div>
                </div>
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                <Label
                  style={{
                    fontSize: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.2ch",
                  }}
                >
                  Bonus{" "}
                </Label>
                <Typography.Title level={2} type="success">
                  3.0x
                </Typography.Title>
              </Col>
            </Row>
          </TimelockField>
          <TimelockField
            title="dNDX"
            description={
              <Typography.Title level={4} style={{ margin: 0 }}>
                4.06 dNDX will be minted.
              </Typography.Title>
            }
          >
            <Typography.Title level={5} type="secondary">
              <em>1.06 base NDX + 3.00 dNDX bonus (3.0x multiplier)</em>
            </Typography.Title>
          </TimelockField>
          <Button type="primary" block={true} style={{ height: "unset" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Create Timelock
            </Typography.Title>
          </Button>
        </Col>
      </Row>
    </Formik>
  );
}
