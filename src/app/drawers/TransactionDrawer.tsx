import { BaseDrawer, createDrawerContext, useDrawerControls } from "./Drawer";
import { ReactNode, useContext } from "react";
import { useTranslation } from "i18n";

export const TransactionContext = createDrawerContext();

export function useTransactionDrawer() {
  return useContext(TransactionContext);
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const drawerControls = useDrawerControls();
  const { active } = drawerControls;

  return (
    <TransactionContext.Provider value={drawerControls}>
      {children}

      {active && <TransactionDrawer />}
    </TransactionContext.Provider>
  );
}

export function TransactionDrawer() {
  const drawerControls = useDrawerControls();
  const { close } = drawerControls;
  const tx = useTranslation();

  return (
    <BaseDrawer title={tx("TRANSACTIONS")} onClose={close}>
      <p>Transactions</p>
    </BaseDrawer>
  );
}
