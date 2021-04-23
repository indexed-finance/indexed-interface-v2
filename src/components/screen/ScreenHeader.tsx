import { Divider, Space } from "antd";
import {
  JazzIcon,
  LanguageSelector,
  Logo,
  ModeSwitch,
  ServerConnection,
  WalletConnector,
} from "components/atomic";
import { selectors } from "features";
import { useSelector } from "react-redux";

export function ScreenHeader() {
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const walletIcon = selectedAddress ? (
    <JazzIcon address={selectedAddress} />
  ) : (
    <WalletConnector />
  );

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>
        <Logo />
      </div>
      <Space size="large" style={{ flex: 1, justifyContent: "flex-end" }}>
        <LanguageSelector />
        <ModeSwitch />
        <ServerConnection showText={true} />
        {walletIcon}
      </Space>
      <Divider
        style={{
          position: "fixed",
          top: 60,
          left: 0,
          width: "100%",
          margin: 0,
        }}
      />
    </div>
  );
}
