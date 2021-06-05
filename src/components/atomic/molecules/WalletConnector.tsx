import { Button } from "antd";
// import { MdAccountBalanceWallet } from "react-icons/md";

import { WalletFilled } from "@ant-design/icons"
import { useWalletConnectionDrawer } from "components/drawers";

export function WalletConnector() {
  const { open } = useWalletConnectionDrawer();
  return (
    <Button type="primary" onClick={open} icon={<WalletFilled width={24} />} shape="round" size="large">
      Connect Wallet
    </Button>
  );
}
