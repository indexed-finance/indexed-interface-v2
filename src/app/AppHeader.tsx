import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { Button } from "components";
import { Form, Layout, Space } from "antd";
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
import styled from "styled-components";

const { Header } = Layout;
const { Item } = Form;

export default function AppHeader() {
  const selectedAddress = useSelector(selectors.selectUserAddress);
  const breakpoints = useBreakpoints();

  // Mobile
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const MobileMenuIcon = mobileMenuActive ? S.MenuFold : S.MenuUnfold;
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
    <S.Top>
      <S.Controls>
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
        <S.Changeables layout="inline" colon={false}>
          <S.ChangeItem>
            <LanguageSelector />
          </S.ChangeItem>
          <S.ChangeItem>{walletButton}</S.ChangeItem>
        </S.Changeables>
      </S.Controls>
    </S.Top>
  ) : (
    <>
      <S.Header>
        <S.Space align="center">
          <Button type="ghost">
            <MobileMenuIcon onClick={toggleMobileMenu} />
          </Button>
          {walletButton}
        </S.Space>
        <Logo />
      </S.Header>
      {mobileMenuActive && (
        <S.MobileMenu>
          <S.AppMenu onItemClick={closeMobileMenu} />
        </S.MobileMenu>
      )}
    </>
  );
}

const S = {
  Top: styled(Header)`
    ${(props) => props.theme.snippets.spacedBetween};
    margin-bottom: ${(props) => props.theme.spacing.large};
    position: fixed;
    top: 0;
    height: 64px;
    width: calc(100% - 299px);
    left: 300px;
    z-index: 2;
  `,
  Controls: styled.div`
    ${(props) => props.theme.snippets.spacedBetween};
    flex: 1;
  `,
  Changeables: styled(Form)``,
  Settings: styled(Button)`
    font-size: ${(props) => props.theme.fontSizes.huge};
    ${(props) => props.theme.snippets.perfectlyCentered}

    a {
      ${(props) => props.theme.snippets.perfectlyCentered};
    }
  `,
  MobileMenu: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: calc(100vw + 1px);
    height: 100vh;
    z-index: 2;
  `,
  MenuFold: styled(AiOutlineMenuFold)`
    font-size: ${(props) => props.theme.fontSizes.huge};
  `,
  MenuUnfold: styled(AiOutlineMenuUnfold)`
    font-size: ${(props) => props.theme.fontSizes.huge};
  `,
  Header: styled(Header)`
    ${(props) => props.theme.snippets.spacedBetween};
    position: fixed;
    top: 0;
    height: 64px;
    width: 100vw;
    z-index: 4;
    padding-right: 0;
    padding-left: 12px;
  `,
  AppMenu: styled(AppMenu)`
    position: fixed;
    top: 65px;
    left: 0;
    z-index: 2;
  `,
  ChangeItem: styled(Item)``,
  Space: styled(Space)`
    position: relative;
    top: 4px;

    .ant-btn {
      padding-left: 4px;
      padding-right: 4px;
    }
  `,
};
