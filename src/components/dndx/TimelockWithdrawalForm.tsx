import { Alert, Button, Switch, Typography } from "antd";
import { Formik } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockField } from "./TimelockField";
import {
  calculateEarlyWithdrawalFee,
  calculateEarlyWithdrawalFeePercent,
  convert,
} from "helpers";

export function TimelockWithdrawalForm() {
  const isReady = true;
  const earlyWithdrawalFee = calculateEarlyWithdrawalFee(
    convert.toBigNumber("10.00"),
    1631303807596 / 1000,
    19476000
  );
  const earlyWithdrawalFeePercent = calculateEarlyWithdrawalFeePercent(
    1631303807596 / 1000,
    19476000
  );

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
        <TimelockField title="Fee">
          {isReady ? (
            <Alert
              type="success"
              showIcon={true}
              message="This timelock is ready to go -- no fee required."
            />
          ) : (
            <Alert
              type="error"
              showIcon={true}
              message="This timelock isn't quite ready -- withdrawing will incur a fee."
            />
          )}
          {!isReady && (
            <Typography.Title
              type="danger"
              level={1}
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#A61C23" }}>
                {earlyWithdrawalFee.displayed} NDX ({earlyWithdrawalFeePercent}
                %)
              </span>
              <small style={{ fontSize: 12 }}>
                <Switch /> I understand a fee will be levied.
              </small>
            </Typography.Title>
          )}
        </TimelockField>
        <Button
          type="primary"
          block={true}
          style={{ height: "unset" }}
          danger={!isReady}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Withdraw from Timelock
          </Typography.Title>
        </Button>
      </>
    </Formik>
  );
}
