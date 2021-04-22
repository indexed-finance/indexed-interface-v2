import { MdAccountBalanceWallet } from "react-icons/md";
import { WalletConnectionContext } from "components/drawers";
import { useContext } from "react";

export function WalletConnector() {
  const { toggle } = useContext(WalletConnectionContext);

  return (
    <MdAccountBalanceWallet
      onClick={toggle}
      fontSize={24}
      style={{ position: "relative", top: 6 }}
    />
  );
}
