import { Page } from "components/atomic";
import { TimelockWithdrawalForm } from "components/dndx";

export default function TimelockWithdrawal() {
  return (
    <Page title="Withdraw from Timelock" hasPageHeader={true}>
      <TimelockWithdrawalForm isReady={true} />
    </Page>
  );
}
