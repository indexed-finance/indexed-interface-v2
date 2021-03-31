import { MdAccountBalanceWallet } from "react-icons/md";
import { WalletConnectionContext } from "app/drawers";
import { useContext } from "react";

export function WalletConnector() {
  const { toggle } = useContext(WalletConnectionContext);

  return (
    <MdAccountBalanceWallet className="WalletConnector" onClick={toggle} />
  );
}
