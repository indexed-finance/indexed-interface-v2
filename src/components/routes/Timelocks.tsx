import { CreateTimelockForm, TimelockCard } from "components/dndx";
import { Page } from "components/atomic";
import { Space } from "antd";
import { convert } from "helpers";
import { requests } from "features";
import { useDispatch } from "react-redux";
import { useEffect, useMemo } from "react";
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
    dndxShares: convert.toBalanceNumber(timelock.dndxShares),
    createdAt: timelock.createdAt,
    owner: timelock.owner,
  }));

  useTimelocksRegistrar(timelockIds);

  useEffect(() => {
    dispatch(requests.fetchUserTimelocks(userAddress));
  }, [dispatch, userAddress]);

  return (
    <Page title="Timelocks" hasPageHeader={true}>
      <Space direction="vertical" size="large">
        <CreateTimelockForm />

        <Space size="large" align="start">
          {formattedTimelocks.map((timelock) => (
            <TimelockCard
              key={timelock.id}
              ndxAmount={timelock.ndxAmount}
              duration={timelock.duration}
              dividends={timelock.dndxShares}
              timeLeft={timelock.createdAt - timelock.duration}
              unlocksAt={timelock.createdAt + timelock.duration}
              createdAt={timelock.createdAt}
            />
          ))}
        </Space>
      </Space>
    </Page>
  );
}
