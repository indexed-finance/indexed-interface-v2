import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  JazzIcon,
  Logo,
  ModeSwitch,
  Navigation,
  ServerConnection,
  WalletConnector,
} from "components/atomic/molecules";
import { Layout, Space } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "hooks";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function LayoutHeader() {
  const { isMobile, xl } = useBreakpoints();
  const [showingUserControls, setShowingUserControls] = useState(false);
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const walletIcon = selectedAddress ? (
    <JazzIcon address={selectedAddress} isWalletIcon={true} />
  ) : (
    <WalletConnector />
  );
  const userControls = (
    <>
      <ModeSwitch />
      <ServerConnection showText={true} />
    </>
  );
  const UserControlCaret = showingUserControls ? FaCaretUp : FaCaretDown;
  const toggleUserControls = () => setShowingUserControls((prev) => !prev);

  useEffect(() => {
    if (xl) {
      setShowingUserControls(false);
    }
  }, [xl]);

  return (
    <Layout.Header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        background: "#151515",
        borderBottom: "2px solid #49ffff",
        zIndex: 10,
        padding: isMobile ? "0 25px" : "0 50px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        {!isMobile && <Navigation />}
        <Space size="large" style={{ justifyContent: "flex-end" }}>
          {xl && userControls}
          {walletIcon}
          {!xl && (
            <UserControlCaret
              onClick={toggleUserControls}
              style={{
                fontSize: 28,
                position: "relative",
                top: 10,
                cursor: "pointer",
              }}
            />
          )}
        </Space>
        {!xl && showingUserControls && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100vw",
              height: 40,
              background: "#151515",
              borderBottom: "1px solid rgba(47, 206, 252, 0.9)",
              borderLeft: "1px solid rgba(47, 206, 252, 0.9)",
              zIndex: 10,
              padding: "0 25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Space size="large">{userControls}</Space>
          </div>
        )}
      </div>
    </Layout.Header>
  );
}
