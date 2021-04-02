import { BaseDrawer, createDrawerContext, useDrawerControls } from "./Drawer";
import { ReactNode, useContext, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useTranslator, useUserAddress } from "hooks";

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
  const provider = useRef<null | ethers.providers.EtherscanProvider>(null);
  const userAddress = useUserAddress();

  useEffect(() => {
    if (!provider.current) {
      provider.current = new ethers.providers.EtherscanProvider();
    }

    if (userAddress) {
      provider.current
        .getHistory(userAddress)
        .then((result) => {
          console.log("r", result);
        })
        .catch(close);
    }
  }, [close, userAddress]);

  return (
    <BaseDrawer title={tx("TRANSACTIONS")} onClose={close} closable={true}>
      <p>Transactions</p>
    </BaseDrawer>
  );
}
