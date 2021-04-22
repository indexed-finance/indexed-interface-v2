import { BaseDrawer, createDrawerContext, useDrawerControls } from "./Drawer";
import { ReactNode, useContext } from "react";
import { useTranslator } from "hooks";

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
  const { close } = useDrawerControls();
  const tx = useTranslator();

  return (
    <BaseDrawer title={tx("TRANSACTIONS")} onClose={close} closable={true}>
      <p>Transactions</p>
    </BaseDrawer>
  );
}
