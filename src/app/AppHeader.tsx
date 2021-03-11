import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { Button, Form, Layout } from "antd";
import {
  JazzIcon,
  LanguageSelector,
  Logo,
  WalletConnectorButton,
} from "components";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import AppMenu from "./AppMenu";

const { Header } = Layout;
const { Item } = Form;

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
  const walletButton = selectedAddress ? (
    <JazzIcon address={selectedAddress} />
  ) : (
    <WalletConnectorButton />
  );

  return breakpoints.lg ? (
    <Header>
      <div>
        {selectedAddress ? (
          <Logo
            title="2800.00 NDX"
            link="/portfolio"
            size="small"
            animated={true}
          />
        ) : (
          <span />
        )}
        <Form layout="inline" colon={false}>
          <Item>
            <LanguageSelector />
          </Item>
          <Item>{walletButton}</Item>
        </Form>
      </div>
    </Header>
  ) : (
    <>
      <Header>
        <div>
          <Button
            icon={<MobileMenuIcon onClick={toggleMobileMenu} />}
            type="ghost"
          />
          {walletButton}
        </div>
        <Logo />
      </Header>
      {mobileMenuActive && <AppMenu onItemClick={closeMobileMenu} />}
    </>
  );
}
