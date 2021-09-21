import { Alert, Button, Col, Row, Typography } from "antd";
import {
  BigNumber,
  calculateBonusMultiplier,
  convert,
  duration,
} from "helpers";
import { DNDX_TIMELOCK_ADDRESS, NDX_ADDRESS } from "config";
import { Formik, FormikProps } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockDurationSlider } from "./TimelockDurationSlider";
import { TimelockField } from "./TimelockField";
import {
  useBalanceAndApprovalRegistrar,
  useTimelockCreator,
  useTokenApproval,
} from "hooks";

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
  const createTimelock = useTimelockCreator();
  const { status, approve } = useTokenApproval({
    spender: DNDX_TIMELOCK_ADDRESS.toLowerCase(),
    tokenId: NDX_ADDRESS.toLowerCase(),
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

  useBalanceAndApprovalRegistrar(DNDX_TIMELOCK_ADDRESS.toLowerCase(), [
    NDX_ADDRESS.toLowerCase(),
  ]);

  return (
    <>
      <TimelockField
        title="Amount"
        description={
          <>
            How much NDX will be locked up?{" "}
            <small>
              <br />
              <em>
                Remember, NDX locked in a timelock can still be used to vote.
              </em>
            </small>
          </>
        }
      >
        <TokenSelector
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
                  Ready In
                </Label>
                <Typography.Title level={2} type="success">
                  {duration(durationValue)}
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
                  {multiplier}%
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
        <Typography.Title level={5} type="secondary">
          <em>
            {amountValue.toFixed(2)} base NDX + {bonusDndx.toFixed(2)} dNDX
            bonus ({multiplier}x multiplier)
          </em>
        </Typography.Title>
      </TimelockField>

      {status === "approval needed" ? (
        <Button
          type="primary"
          block={true}
          style={{ height: "unset" }}
          onClick={approve}
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
          disabled={status === "unknown"}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Create Timelock
          </Typography.Title>
        </Button>
      )}
    </>
  );
}
