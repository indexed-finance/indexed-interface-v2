import { Page } from "components/atomic";
import { Space } from "antd";
import { TimelockCard } from "components/dndx";
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
    dndxAmount: parseFloat(
      convert.toBalance(convert.toBigNumber(timelock.ndxAmount))
    ),
    duration: timelock.duration / 1000,
    dndxShares: parseFloat(timelock.dndxShares),
    createdAt: timelock.createdAt / 1000,
    owner: timelock.owner,
  }));

  useTimelocksRegistrar(timelockIds);

  useEffect(() => {
    dispatch(requests.fetchUserTimelocks(userAddress));
  }, [dispatch, userAddress]);

  return (
    <Page title="Timelocks" hasPageHeader={true}>
      <Space direction="vertical" size="large">
        {JSON.stringify(formattedTimelocks, null, 2)}

        <Space size="large" align="start">
          {formattedTimelocks.map((timelock) => (
            <TimelockCard
              key={timelock.id}
              dndxAmount={timelock.dndxAmount}
              duration={timelock.duration}
              dividends={timelock.dndxShares}
              timeLeft={timelock.createdAt - timelock.duration}
              baseNdxAmount={0}
              unlocksAt={timelock.createdAt + timelock.duration}
              createdAt={timelock.createdAt}
            />
          ))}
        </Space>
      </Space>
    </Page>
  );
}
