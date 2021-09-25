import { Alert, Button, Switch, Typography } from "antd";
import { Amount, FormattedDividendsLock, calculateDividendShares } from "helpers";
import { Formik, FormikProps } from "formik";
import { Label, TokenSelector } from "components/atomic";
import { TimelockField } from "./TimelockField";
import {
  calculateEarlyWithdrawalFee,
  calculateEarlyWithdrawalFeePercent,
  convert,
} from "helpers";
import { timestampNow } from "helpers"
import { useCallback, useMemo, useState } from "react";
import { useDndxBalance, useTimelockWithdrawCallbacks } from "hooks";

const ZERO = {
  displayed: "0.00",
  exact: convert.toBigNumber("0.00"),
};

type WithdrawalValue = {
  amount: Amount
}

export function TimelockWithdrawalForm({ lock }: { lock: FormattedDividendsLock }) {
  return (
    <Formik
      initialValues={{
        amount: ZERO,
      }}
      onSubmit={console.info}
    >
      {(props) => <TimelockWithdrawalFormInner {...props} lock={lock} />}
    </Formik>
  );
}

type Props = FormikProps<WithdrawalValue> & { lock: FormattedDividendsLock }

export function TimelockWithdrawalFormInner({ lock, values, setFieldValue  }: Props) {
  const isReady = timestampNow() >= lock.unlockAt;
  const [didAcknowledgeFee, setDidAcknowledgeFee] = useState(false);
  const { destroy, withdraw } = useTimelockWithdrawCallbacks(lock.id)
  // const [canWithdraw, setCanWithdraw] = useState(false);
  const dndxBalance = useDndxBalance()
  const burnAmount = calculateDividendShares(values.amount, lock.duration);
  const sufficientDndx = useMemo(() => burnAmount.exact.lte(dndxBalance.exact), [burnAmount.exact, dndxBalance.exact]);
  const disableWithdraw = useMemo(() => {
    if (!sufficientDndx) return true;
    if (!isReady && !didAcknowledgeFee) return true;
    return values.amount.exact.eq(0)
  }, [isReady, didAcknowledgeFee, sufficientDndx, values.amount])

  const earlyWithdrawalFee = isReady ? undefined : calculateEarlyWithdrawalFee(
    values.amount.exact,
    lock.unlockAt,
    lock.duration
  );
  const earlyWithdrawalFeePercent = isReady ? undefined : calculateEarlyWithdrawalFeePercent(
    lock.unlockAt,
    lock.duration
  );

  const handleSubmit = useCallback(() => {
    if (values.amount.exact.eq(0)) return;
    if (values.amount.exact.eq(lock.ndxAmount.exact)) {
      destroy()
    } else {
      withdraw(values.amount.exact)
    }
  }, [destroy, withdraw, lock.ndxAmount, values.amount])

  return (
    <>
      <>
        <TimelockField
          title="Withdraw"
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
              isInput
              loading={false}
              assets={[]}
              balanceOverride={lock.ndxAmount}
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
            <span>
              <div style={{ textAlign: "right" }}>
                <Label
                  style={{
                    fontSize: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.2ch",
                  }}
                >
                  Locked{" "}
                </Label>
                <Typography.Title
                  level={4}
                  type="success"
                  style={{ margin: 0 }}
                >
                  {lock.ndxAmount.displayed} NDX
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
              message="This timelock has expired and your deposited NDX are available for withdrawal."
            />
          ) : (
            <Alert
              type="error"
              showIcon={true}
              message="This timelock has not expired. Withdrawing now will incur an early withdrawal fee."
            />
          )}
          {earlyWithdrawalFee && (
            <>
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
                <Switch checked={didAcknowledgeFee} onChange={setDidAcknowledgeFee} />{" "}
                <small style={{ fontSize: 16 }}>
                  I understand a fee will be levied.
                </small>
              </Typography.Title>
              <Typography.Title
                level={2}
                style={{
                  marginTop: 24,
                }}
              >
                You will receive <span style={{ color: "#38ee7b" }}>
                  {convert.toBalance(values.amount.exact.minus(earlyWithdrawalFee.exact), 18, false, 4)}
                </span> NDX
              </Typography.Title>
              </>
          )}
        </TimelockField>
        <TimelockField
          title="dNDX"
          description={
            <Typography.Title level={4} {...(sufficientDndx ? {} : {type: "danger"})} style={{ margin: 0 }}>
              {
                sufficientDndx
                  ? <>This withdrawal will burn {burnAmount.displayed} dNDX.</>
                  : <> This withdrawal requires that you burn {burnAmount.displayed} dNDX, but you only have {dndxBalance.displayed}.</>
              }
              
            </Typography.Title>
          }
        ></TimelockField>
        <Button
          type="primary"
          block={true}
          style={{ height: "unset" }}
          danger={!isReady}
          disabled={disableWithdraw}
          onClick={handleSubmit}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Withdraw from Timelock
          </Typography.Title>
        </Button>
      </>
    </>
  );
}
