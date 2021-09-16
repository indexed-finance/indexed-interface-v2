import { Alert, Button, Switch, Typography } from "antd";
import { Formik } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockField } from "./TimelockField";
import {
  calculateEarlyWithdrawalFee,
  calculateEarlyWithdrawalFeePercent,
  convert,
} from "helpers";

interface Props {
  isReady: boolean;
}

export function TimelockWithdrawalForm({ isReady }: Props) {
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
              alignItems: "flex-start",
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
                <Typography.Title
                  level={4}
                  type="success"
                  style={{ margin: 0 }}
                >
                  12.06 NDX
                </Typography.Title>
                {isReady && (
                  <Button type="dashed" style={{ marginLeft: 24 }}>
                    Take All
                  </Button>
                )}
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
              }}
            >
              <span style={{ color: "#A61C23" }}>
                {earlyWithdrawalFee.displayed} NDX ({earlyWithdrawalFeePercent}
                %)
              </span>
              <br />
              <Switch />{" "}
              <small style={{ fontSize: 16 }}>
                I understand a fee will be levied.
              </small>
            </Typography.Title>
          )}
        </TimelockField>
        <TimelockField
          title="dNDX"
          description={
            <Typography.Title level={4} style={{ margin: 0 }}>
              4.06 dNDX will be burned.
            </Typography.Title>
          }
        ></TimelockField>
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
