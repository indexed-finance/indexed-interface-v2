import { Alert, Button, Divider, Typography } from "antd";
import { Formik } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockField } from "./TimelockField";
import { convert } from "helpers";

export function TimelockWithdrawalForm() {
  const isReady = true;

  return (
    <Formik
      initialValues={{
        amount: {
          displayed: "0.00",
          exact: convert.toBigNumber("0.00"),
        },
      }}
      onSubmit={console.info}
    >
      <>
        <Divider />
        <TimelockField
          title="Amount"
          description="How much NDX do you wish to withdraw?"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TokenSelector
              loading={false}
              assets={[]}
              showBalance={false}
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
            <span>
              <div style={{ textAlign: "right" }}>
                <Label
                  style={{
                    fontSize: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.2ch",
                  }}
                >
                  Available{" "}
                </Label>
                <Typography.Title level={2} type="success">
                  12.06 NDX
                </Typography.Title>
              </div>
            </span>
          </div>
        </TimelockField>
        <TimelockField title="Fees">
          {isReady ? (
            <Alert
              type="success"
              showIcon={true}
              message="This timelock is ready to go -- no fee required."
            />
          ) : (
            <Alert
              type="warning"
              showIcon={true}
              message="This timelock isn't quite ready -- withdrawing will incur a fee."
            />
          )}
        </TimelockField>
        <Button type="primary" block={true} style={{ height: "unset" }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Withdraw from Timelock
          </Typography.Title>
        </Button>
      </>
    </Formik>
  );
}
