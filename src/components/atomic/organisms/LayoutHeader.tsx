import { AiOutlineUser } from "react-icons/ai";
import { ExternalLink } from "components/atomic/atoms";
import {
  FaCaretDown,
  FaCaretUp,
  FaGavel,
  FaNetworkWired,
  FaSwimmingPool,
} from "react-icons/fa";
import {
  JazzIcon,
  Logo,
  ModeSwitch,
  Navigation,
  ServerConnection,
  WalletConnector,
} from "components/atomic/molecules";
import { Layout, Menu, Space } from "antd";
import { Link } from "react-router-dom";
import { selectors } from "features";
import { useBreakpoints, useTranslator } from "hooks";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EthIcon from "images/eth.png";
import Icon from "@ant-design/icons";
import MaticIcon from "images/matic.png";

export function LayoutHeader() {
  const tx = useTranslator();
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
      {!xl && (
        <Menu mode="vertical" style={{ width: "100%" }}>
          <Menu.Item key="index-pools">
            <Link to="/index-pools">
              <Space size="small">
                <FaSwimmingPool style={{ position: "relative", top: 2 }} />
                Indexes
              </Space>
            </Link>
          </Menu.Item>

          <Menu.Item>
            <ExternalLink
              to="https://legacy.indexed.finance/governance"
              withIcon={false}
            >
              <Space size="small">
                <FaGavel style={{ position: "relative", top: 2 }} /> Governance
              </Space>
            </ExternalLink>
          </Menu.Item>

          <Menu.SubMenu
            title={<span style={{ marginLeft: 10 }}>Network</span>}
            icon={<FaNetworkWired style={{ position: "relative" }} />}
            style={{
              flex: 1,
              background: "transparent",
              display: "block",
            }}
            className="make_blocky"
          >
            <Menu.Item key="eth-network">
              <Icon src={EthIcon} style={{ position: "relative", top: 2 }} />{" "}
              Ethereum
            </Menu.Item>
            <Menu.Item key="matic-network">
              <Icon
                src={MaticIcon}
                style={{ position: "relative", top: 2, maxHeight: "20px" }}
              />{" "}
              Polygon
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="mode">
            <ModeSwitch />
          </Menu.Item>

          <Menu.Item key="connection">
            <ServerConnection showText={true} />
          </Menu.Item>
        </Menu>
      )}
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
              // height: 40,
              background: "#151515",
              borderBottom: "1px solid rgba(47, 206, 252, 0.9)",
              borderLeft: "1px solid rgba(47, 206, 252, 0.9)",
              zIndex: 10,
              padding: "0 25px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Space size="large">{userControls}</Space>
          </div>
        )}
      </div>
    </Layout.Header>
  );
}
