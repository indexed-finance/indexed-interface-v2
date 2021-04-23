import {
  JazzIcon,
  LanguageSelector,
  Logo,
  ModeSwitch,
  ServerConnection,
  WalletConnector,
} from "components/atomic";
import { Navigation } from "./Navigation";
import { Space } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "hooks";
import { useSelector } from "react-redux";

export function ScreenHeader() {
  const { isMobile } = useBreakpoints();
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
      {!isMobile && (
        <div
          style={{
            flex: 3,
          }}
        >
          <Navigation />
        </div>
      )}
      <Space size="large" style={{ flex: 1, justifyContent: "flex-end" }}>
        <LanguageSelector />
        <ModeSwitch />
        <ServerConnection showText={true} />
        {walletIcon}
      </Space>
    </div>
  );
}
