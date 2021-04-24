import { MdAccountBalanceWallet } from "react-icons/md";
import { useWalletConnectionDrawer } from "components/drawers";

export function WalletConnector() {
  const { open } = useWalletConnectionDrawer();

  return (
    <MdAccountBalanceWallet
      onClick={open}
      fontSize={24}
      style={{ position: "relative", top: 6 }}
    />
  );
}
