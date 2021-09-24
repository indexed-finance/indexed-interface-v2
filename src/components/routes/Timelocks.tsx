import { AiOutlinePlusCircle } from "react-icons/ai";
import { Alert, Button, Col, Row, Space, Typography } from "antd";
import { Label, Page, Token } from "components/atomic";
import { TimelockCard } from "components/dndx";
import { convert } from "helpers";
import { requests, selectors } from "features";
import {
  useBreakpoints,
  useTimelocksRegistrar,
  useUserAddress,
  useUserTimelocks,
} from "hooks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";

export default function Timelocks() {
  const dispatch = useDispatch();
  const userAddress = useUserAddress();
  const timelocks = useUserTimelocks();
  const timelockIds = useMemo(() => timelocks.map(({ id }) => id), [timelocks]);
  const formattedTimelocks = timelocks
    .filter((timelock) => Object.hasOwnProperty.call(timelock, "ndxAmount"))
    .map((timelock) => ({
      id: timelock.id,
      ndxAmount: convert.toBalanceNumber(timelock.ndxAmount),
      duration: timelock.duration,
      dndxShares: parseFloat(convert.toBalance(timelock.dndxShares)),
      createdAt: timelock.createdAt,
      owner: timelock.owner,
    }));
  const history = useHistory();
  const dndx = useSelector(selectors.selectDndxBalance);
  const { withdrawn, withdrawable } = useSelector(selectors.selectDividendData);
  const { isMobile } = useBreakpoints();

  useTimelocksRegistrar(timelockIds);

  useEffect(() => {
    dispatch(requests.fetchUserTimelocks(userAddress));
  }, [dispatch, userAddress]);

  return (
    <Page
      title="Timelocks"
      hasPageHeader={true}
      extra={
        <Button
          type="primary"
          block={true}
          style={{ height: "unset" }}
          onClick={() => history.push("/create-timelock")}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            New Timelock
            <AiOutlinePlusCircle
              style={{ position: "relative", top: 5, left: 5 }}
            />
          </Typography.Title>
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={12}>
          <Col
            xs={24}
            lg={8}
            style={{
              marginBottom: isMobile ? 24 : 0,
            }}
          >
            <Typography.Title
              type="warning"
              level={3}
              style={{
                marginRight: 24,
                textTransform: "uppercase",
              }}
            >
              dNDX
            </Typography.Title>
            <Token
              symbol="NDX"
              symbolOverride="dNDX"
              name="dNDX"
              amount={dndx}
              size="large"
            />
          </Col>
          <Col xs={24} lg={8}>
            <Typography.Title
              type="warning"
              level={3}
              style={{
                marginRight: 24,
                textTransform: "uppercase",
              }}
            >
              Dividends
            </Typography.Title>
            <Space direction="vertical">
              <Typography.Title style={{ margin: 0 }} level={3}>
                <Label>Claimed</Label> {withdrawn} WETH
              </Typography.Title>
              <Space
                align="end"
                style={{ justifyContent: "space-between", width: "100%" }}
              >
                <Typography.Title style={{ margin: 0 }} level={3}>
                  <Label>Earned</Label> {withdrawable} WETH
                </Typography.Title>
                <Button style={{ marginLeft: 24 }}>Claim</Button>
              </Space>
            </Space>
          </Col>
        </Row>
        <Typography.Title
          type="warning"
          level={3}
          style={{
            marginRight: 24,
            textTransform: "uppercase",
          }}
        >
          Your timelocks
        </Typography.Title>

        {formattedTimelocks.length === 0 ? (
          <Alert
            type="info"
            message="It doesn't look like you have any timelocks yet -- press the New Timelock button to get started."
          />
        ) : (
          <Row wrap={true}>
            {formattedTimelocks.map((timelock) => {
              const creationDate = timelock.createdAt * 1000;
              const fullDuration = timelock.duration * 1000;
              const unlockDate = creationDate + fullDuration;
              const timeLeft = unlockDate - new Date().getTime();

              return (
                <Col xs={24} lg={8}>
                  <TimelockCard
                    key={timelock.id}
                    id={timelock.id}
                    ndxAmount={timelock.ndxAmount}
                    dividends={timelock.dndxShares}
                    duration={timelock.duration}
                    timeLeft={timeLeft / 1000}
                    unlocksAt={unlockDate / 1000}
                    createdAt={timelock.createdAt}
                  />
                </Col>
              );
            })}
          </Row>
        )}
      </Space>
    </Page>
  );
}
