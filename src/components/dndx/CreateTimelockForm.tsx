import { Alert, Button, Col, Row, Typography } from "antd";
import {
  BigNumber,
  calculateBonusMultiplier,
  calculateEarlyWithdrawalFeePercent,
  convert,
  duration,
  timestampNow,
} from "helpers";
import { DNDX_TIMELOCK_ADDRESS, NDX_ADDRESS } from "config";
import { Formik, FormikProps } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockDurationSlider } from "./TimelockDurationSlider";
import { TimelockField } from "./TimelockField";
import {
  useBalanceAndApprovalRegistrar,
  useChainId,
  useCreateTimelockCallback,
  useTokenApproval,
} from "hooks";
import { useMemo } from "react";

interface TimelockValues {
  amount: {
    displayed: string;
    exact: BigNumber;
  };
  duration: BigNumber;
}

const ZERO = {
  displayed: "0.00",
  exact: convert.toBigNumber("0.00"),
};

export function CreateTimelockForm() {
  return (
    <Formik
      initialValues={{
        amount: ZERO,
        duration: convert.toBigNumber("7776000"),
      }}
      onSubmit={console.info}
    >
      {(props) => <CreateTimelockFormInner {...props} />}
    </Formik>
  );
}

function CreateTimelockFormInner({
  values,
  setFieldValue,
}: FormikProps<TimelockValues>) {
  const chainId = useChainId();
  const timelockAddress = DNDX_TIMELOCK_ADDRESS[chainId];
  const ndxAddress = NDX_ADDRESS[chainId];
  const createTimelock = useCreateTimelockCallback();
  const { status, approve } = useTokenApproval({
    spender: timelockAddress.toLowerCase(),
    tokenId: ndxAddress.toLowerCase(),
    amount: values.amount.displayed,
    rawAmount: values.amount.exact.toString(),
    symbol: "NDX",
  });
  const amountValue = parseFloat(values.amount.displayed);
  const durationValue = values.duration.toNumber();
  const multiplier = parseFloat(
    calculateBonusMultiplier(durationValue).displayed
  );
  const bonusDndx = amountValue * multiplier;
  const totalDndx = amountValue + bonusDndx;
  const isBelowMinimum = useMemo(() => amountValue !== 0 && amountValue < 100, [amountValue]);

  useBalanceAndApprovalRegistrar(timelockAddress.toLowerCase(), [
    ndxAddress.toLowerCase(),
  ]);

  return (
    <>
      <TimelockField
        title="Deposit"
        description={
          <>
            How much NDX will be locked up?{" "}
            <small>
              <br />
              <em> Voting shares for deposited NDX will automatically be delegated to you. </em>
            </small>
          </>
        }
      >
        <TokenSelector
          isInput
          loading={false}
          assets={[]}
          value={{
            amount: values.amount,
            token: "NDX",
          }}
          selectable={false}
          onChange={(newValues) => {
            if (newValues.amount) {
              setFieldValue("amount", newValues.amount);
            }
          }}
        />
        {isBelowMinimum && <Typography.Text type="danger">Can not deposit less than 100 NDX</Typography.Text>}
      </TimelockField>
      <TimelockField
        title="Duration"
        description="Adjust how long the timelock takes to mature."
      >
        <Row align="middle" gutter={36}>
          <Col span={24} style={{ marginBottom: 24 }}>
            <Alert
              type="info"
              message={
                <TimelockDurationSlider
                  value={values.duration}
                  onChange={(newDuration) => {
                    setFieldValue("duration", newDuration);
                  }}
                />
              }
            />
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
                  Lock For
                </Label>
                <Typography.Title level={2} type="success">
                  {duration(durationValue)}
                </Typography.Title>

                <Typography.Title level={5} type="secondary">
                  <em>
                    Withdrawing early will incur a penalty determined by the remaining time in the lock and the bonus multiplier.
                  </em>
                  <br />
                  <em>The maximum early withdrawal fee for this lock is {calculateEarlyWithdrawalFeePercent(timestampNow() + durationValue, durationValue)}%</em>

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
                  +{multiplier.toFixed(2)}x
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
            {totalDndx.toFixed(2)} dNDX will be minted.
          </Typography.Title>
        }
      >
        <Typography.Title level={5} >
          <Typography.Text>{amountValue.toFixed(2)} NDX deposited</Typography.Text>
          <br />
          <Typography.Text type="success" style={{ marginLeft: '1em' }}>+ {bonusDndx.toFixed(2)} ({multiplier}x bonus)</Typography.Text>
          <br />
          <Typography.Text type="warning" style={{ marginLeft: '1em' }}>= {totalDndx} dNDX</Typography.Text>
     {/*      <br />
          <em style={{ marginLeft: '1em' }}> + {bonusDndx.toFixed(2)} ({multiplier}x bonus) </em>
          <br />
          <em style={{ marginLeft: '1em' }}> = {totalDndx} dNDX </em> */}
        </Typography.Title>
        <Typography.Title level={5} type="danger">
          dNDX is an ERC20 token that can be traded freely; however,
          in order to withdraw all or some of your deposited NDX, you
          will be required to burn a proportionate amount of dNDX according to the timelock multiplier.
        </Typography.Title>
      </TimelockField>

      {status === "approval needed" ? (
        <Button
          type="primary"
          block={true}
          style={{ height: "unset" }}
          onClick={approve}
          disabled={parseFloat(values.amount.displayed) === 0}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Approve
          </Typography.Title>
        </Button>
      ) : (
        <Button
          type="primary"
          block={true}
          style={{ height: "unset" }}
          onClick={() => createTimelock(values.amount.exact, values.duration)}
          disabled={
            status === "unknown" ||
            parseFloat(values.amount.displayed) === 0 ||
            isBelowMinimum
          }
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Create Timelock
          </Typography.Title>
        </Button>
      )}
    </>
  );
}
