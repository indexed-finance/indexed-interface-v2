import { CreateTimelockForm } from "components/timelock";
import { Page } from "components/layout";

export default function CreateTimelock() {
  return (
    <Page title="Create Timelock" hasPageHeader={true}>
      <CreateTimelockForm />
    </Page>
  );
}
