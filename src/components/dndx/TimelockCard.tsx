import { Alert, Button, Card, Progress, Space, Typography } from "antd";
import { Label } from "components/atomic";
import {
  calculateBonusMultiplier,
  calculateEarlyWithdrawalFeePercent,
  duration,
} from "helpers";
import { useHistory } from "react-router-dom";

export interface Props {
  id: string;
  ndxAmount: number;
  duration: number;
  dividends: number;
  timeLeft: number;
  unlocksAt: number;
  createdAt: number;
}

export function TimelockCard(props: Props) {
  const bonusMultiplier = calculateBonusMultiplier(props.duration);
  const formattedDuration = duration(props.duration);
  const formattedTimeLeft = duration(props.timeLeft);
  const percentage = (1 - (props.timeLeft * 1000) / props.duration) * 100;
  const isReady = props.timeLeft <= 0;
  const earlyWithdrawalFeePercent = calculateEarlyWithdrawalFeePercent(
    props.unlocksAt,
    props.duration
  );
  const history = useHistory();

  //
  const amountValue = props.ndxAmount;
  const multiplier = parseFloat(bonusMultiplier.displayed);
  const bonusDndx = amountValue * multiplier;
  const totalDndx = amountValue + bonusDndx;

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
          {totalDndx.toFixed(2)} dNDX
        </Typography.Title>
      }
    >
      <Alert
        type="info"
        style={{ borderRadius: 0, marginBottom: 18 }}
        message={
          <>
            Deposit of {props.ndxAmount.toFixed(2)} NDX for {formattedDuration}{" "}
            with a {bonusMultiplier.displayed}x bonus.
          </>
        }
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div key="timeLeft">
          {isReady ? (
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Typography.Title style={{ margin: 0 }} level={3} type="success">
                Ready
              </Typography.Title>
              <Button
                  type="primary"
                  danger={!isReady}
                  onClick={() => history.push(`/timelocks/${props.id}`)}
                >
                  Withdraw
                </Button>
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
                <Button
                  type="primary"
                  danger={!isReady}
                  onClick={() => history.push(`/timelocks/${props.id}`)}
                >
                  Withdraw
                </Button>
              </Space>
              <Alert
                style={{ marginTop: 12 }}
                type="error"
                message={`Withdrawing from this timelock early will result in a fee of ${earlyWithdrawalFeePercent}%`}
              />
            </>
          )}
        </div>
      </Space>
    </Card>
  );
}
