import { Page } from "components/atomic";
import { TimelockWithdrawalForm } from "components/dndx";
import { useMemo } from "react";
import { useParams } from "react-router";
import { useTimelocksRegistrar, useUserTimelock, useUserTimelocks } from "hooks";

export default function TimelockWithdrawal() {
  const timelocks = useUserTimelocks();
  const timelockIds = useMemo(() => timelocks.map(({ id }) => id), [timelocks]);
  useTimelocksRegistrar(timelockIds);
  const { id } = useParams<{ id: string }>();
  const lock = useUserTimelock(id)
  return (
    <Page title="Withdraw from Timelock" hasPageHeader={true}>
      {lock && <TimelockWithdrawalForm lock={lock} />}
    </Page>
  );
}
