import { Alert, Button, Card, Col, Row, Space, Typography } from "antd";
import { Label, Page, Progress } from "components/atomic";
import {
  calculateBonusMultiplier,
  calculateEarlyWithdrawalFee,
  convert,
} from "helpers";
import { formatDistance } from "date-fns";

export default function Timelocks() {
  return (
    <Page title="Timelocks" hasPageHeader={true}>
      <Row>
        <Col span={8}>
          <TimelockCard
            dndxAmount={58.24}
            baseNdxAmount={14.56}
            duration={31104000}
            dividends={12.04}
            timeLeft={0}
            unlocksAt={1631303807596}
          />
        </Col>
        <Col span={8}>
          <TimelockCard
            dndxAmount={58.24}
            baseNdxAmount={14.56}
            duration={31104000}
            dividends={12.04}
            timeLeft={1037000}
            unlocksAt={1631303807596}
          />
        </Col>
      </Row>
    </Page>
  );
}

//

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
  const earlyWithdrawalFee = calculateEarlyWithdrawalFee(
    convert.toBigNumber(props.baseNdxAmount.toString()),
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
                message={`Withdrawing this timelock early will result in a fee of ${earlyWithdrawalFee.displayed}`}
              />
            </>
          )}
        </div>
      </Space>
    </Card>
  );
}
