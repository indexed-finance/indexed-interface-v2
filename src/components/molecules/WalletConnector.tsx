import { MdAccountBalanceWallet } from "react-icons/md";
import { WalletConnectionContext } from "app/drawers";
import { useContext } from "react";

export default function WalletConnector() {
  const { toggleDrawer } = useContext(WalletConnectionContext);

  return (
    <MdAccountBalanceWallet
      className="WalletConnector"
      onClick={toggleDrawer}
    />
  );
}
