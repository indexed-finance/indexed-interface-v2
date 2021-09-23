import { AiOutlinePlusCircle } from "react-icons/ai";
import { Alert, Button, Space, Typography } from "antd";
import { Page } from "components/atomic";
import { TimelockCard } from "components/dndx";
import { convert } from "helpers";
import { requests } from "features";
import { useDispatch } from "react-redux";
import { useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { useTimelocksRegistrar, useUserAddress, useUserTimelocks } from "hooks";

export default function Timelocks() {
  const dispatch = useDispatch();
  const userAddress = useUserAddress();
  const timelocks = useUserTimelocks();
  const timelockIds = useMemo(() => timelocks.map(({ id }) => id), [timelocks]);
  const formattedTimelocks = timelocks.map((timelock) => ({
    id: timelock.id,
    ndxAmount: convert.toBalanceNumber(timelock.ndxAmount),
    duration: timelock.duration,
    dndxShares: parseFloat(convert.toBalance(timelock.dndxShares)),
    createdAt: timelock.createdAt,
    owner: timelock.owner,
  }));
  const history = useHistory();

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
          onClick={() => history.push("/timelocks/new")}
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
      <Space direction="vertical" size="large">
        <Typography.Title
          type="warning"
          level={3}
          style={{
            margin: 0,
            marginRight: 24,
            textTransform: "uppercase",
          }}
        >
          Your timelocks
        </Typography.Title>

        {formattedTimelocks.length === 0 ? (
          <Alert
            type="info"
            message="It doesn't look like you have any timelocks yet -- press the New Timelock button to get started!"
          />
        ) : (
          <Space size="large" align="start">
            {formattedTimelocks.map((timelock) => {
              const creationDate = timelock.createdAt * 1000;
              const fullDuration = timelock.duration * 1000;
              const unlockDate = creationDate + fullDuration;
              const timeLeft = unlockDate - new Date().getTime();

              return (
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
              );
            })}
          </Space>
        )}
      </Space>
    </Page>
  );
}
