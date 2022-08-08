import { IndexPoolWidgetGroup } from "components/index-pool";
import { Page } from "components/layout";

import { useTranslator } from "hooks";

export default function IndexPools() {
  const tx = useTranslator();

  return (
    <Page hasPageHeader={true} title={tx("INDEX_POOLS")}>
      <IndexPoolWidgetGroup />
    </Page>
  );
}
