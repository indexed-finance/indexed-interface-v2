import { IndexPoolWidgetGroup, Page } from "components/atomic";
import { useTranslator } from "hooks";

export default function IndexPools() {
  const tx = useTranslator();

  return (
    <Page hasPageHeader={true} title={tx("INDEX_POOLS")}>
      <IndexPoolWidgetGroup />
    </Page>
  );
}
