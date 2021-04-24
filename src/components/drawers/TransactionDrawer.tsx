import { BaseDrawer, useDrawer } from "./Drawer";
import { useTranslator } from "hooks";

export function TransactionDrawer() {
  const tx = useTranslator();
  const { close } = useDrawer();

  return (
    <BaseDrawer title={tx("TRANSACTIONS")} onClose={close} closable={true}>
      <p>Transactions</p>
    </BaseDrawer>
  );
}
