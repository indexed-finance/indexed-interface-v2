import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { JazzIcon, LanguageSelector, Logo, WalletConnector } from "components";
import { Layout, Menu } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import React from "react";

interface Props {
  mobileMenuActive: boolean;
  onToggleMobileMenu(): void;
}

const { Header } = Layout;

export default function AppHeader({
  mobileMenuActive,
  onToggleMobileMenu,
}: Props) {
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const breakpoints = useBreakpoints();
  const MobileMenuIcon = mobileMenuActive
    ? AiOutlineMenuFold
    : AiOutlineMenuUnfold;

  return (
    <>
      <Header
        className="AppHeader"
        style={{
          flexDirection: breakpoints.isMobile ? "row-reverse" : "row",
        }}
      >
        <Logo withTitle={true} />
        <div>
          {!breakpoints.isMobile && <LanguageSelector />}
          <Menu
            selectable={false}
            mode="horizontal"
            className="AppHeader-menu"
            style={{
              left: breakpoints.isMobile ? 0 : "unset",
              right: breakpoints.isMobile ? "unset" : 0,
            }}
          >
            {breakpoints.isMobile && (
              <Menu.Item
                icon={<MobileMenuIcon className="MenuButton" />}
                onClick={onToggleMobileMenu}
              />
            )}
            <Menu.Item
              icon={
                selectedAddress ? (
                  <JazzIcon address={selectedAddress} />
                ) : (
                  <WalletConnector />
                )
              }
            />
          </Menu>
        </div>
      </Header>
    </>
  );
}
