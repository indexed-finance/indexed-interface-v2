import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { JazzIcon, LanguageSelector, Logo, WalletConnector } from "components";
import { Layout, Typography } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";

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
  const icon = selectedAddress ? (
    <JazzIcon address={selectedAddress} />
  ) : (
    <WalletConnector />
  );

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
          {breakpoints.isMobile && (
            <MobileMenuIcon
              className="MenuButton"
              onClick={onToggleMobileMenu}
            />
          )}
          {!breakpoints.isMobile && icon}
        </div>
      </Header>
      {breakpoints.isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 50,
            left: 20,
            zIndex: 8,
            opacity: 0.3,
          }}
        >
          (<Typography.Text>{icon}</Typography.Text>)
        </div>
      )}
    </>
  );
}
