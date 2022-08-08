import { Button } from "antd";

import { WalletFilled } from "@ant-design/icons";
import { useWalletConnectionDrawer } from "./";

export function WalletConnector() {
  const { open } = useWalletConnectionDrawer();

  return (
    <Button
      className="plus"
      type="primary"
      onClick={open}
      icon={<WalletFilled width={24} />}
      size="large"
      style={{ marginLeft: 12 }}
    >
      Connect Wallet
    </Button>
  );
}
