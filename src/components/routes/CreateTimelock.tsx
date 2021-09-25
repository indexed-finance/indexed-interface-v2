import { CreateTimelockForm } from "components/dndx";
import { Page } from "components/atomic";

export default function CreateTimelock() {
  return (
    <Page title="Create Timelock" hasPageHeader={true}>
      <CreateTimelockForm />
    </Page>
  );
}
