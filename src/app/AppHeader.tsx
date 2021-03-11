import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { JazzIcon, LanguageSelector, Logo, WalletConnector } from "components";
import { Layout, Menu } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import AppMenu from "./AppMenu";

const { Header } = Layout;

export default function AppHeader() {
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const breakpoints = useBreakpoints();

  // Mobile
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const MobileMenuIcon = mobileMenuActive
    ? AiOutlineMenuFold
    : AiOutlineMenuUnfold;
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );

  // Common
  const ndxAmount = selectedAddress ? (
    <Logo title="2800.00 NDX" link="/portfolio" size="small" animated={true} />
  ) : (
    <span />
  );

  return (
    <>
      <Header
        className="AppHeader"
        style={{
          flexDirection: breakpoints.isMobile ? "row-reverse" : "row",
        }}
      >
        <div>
          <Logo withTitle={true} />
          {breakpoints.lg && ndxAmount}
        </div>
        <div>
          {!breakpoints.isMobile && <LanguageSelector />}
          <Menu
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
                onClick={toggleMobileMenu}
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
      {mobileMenuActive && <AppMenu onItemClick={closeMobileMenu} />}
    </>
  );
}
