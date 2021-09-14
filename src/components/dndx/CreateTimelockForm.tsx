import { Alert, Button, Col, Row, Typography } from "antd";
import { Formik } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockDurationSlider } from "./TimelockDurationSlider";
import { TimelockField } from "./TimelockField";
import { convert, duration } from "helpers";

export function CreateTimelockForm() {
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
              <Col span={18} offset={3} style={{ marginBottom: 24 }}>
                <Alert type="info" message={<TimelockDurationSlider />} />
              </Col>
              <Col span={24}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <Label
                      style={{
                        fontSize: 20,
                        textTransform: "uppercase",
                        letterSpacing: "0.2ch",
                      }}
                    >
                      Ready In
                    </Label>
                    <Typography.Title level={2} type="success">
                      {duration(19476000)}
                    </Typography.Title>
                  </div>
                  <div style={{ textAlign: "right" }}>
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
                      2.0x
                    </Typography.Title>
                  </div>
                </div>
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
