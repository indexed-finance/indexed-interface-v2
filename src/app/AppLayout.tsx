import { Affix, Breadcrumb, Grid, Layout } from "antd";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { Drawer, DrawerContext, QuoteCarousel } from "components";
import { FormattedIndexPool, selectors } from "features";
import { GlobalStyles } from "theme";
import { Logo } from "components";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { changeMode } from "theme";
import { useSelector } from "react-redux";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import React, { useCallback, useContext, useState } from "react";
import SocketClient from "sockets/client";
import routes from "./routes";
import styled from "styled-components";

const { useBreakpoint } = Grid;
const { Sider, Header, Content } = Layout;

export default function AppLayout() {
  const { activePage } = useContext(DrawerContext);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const theme = useSelector(selectors.selectTheme);
  const breakpoint = useBreakpoint();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const MobileMenuIcon = mobileMenuActive ? S.MenuFold : S.MenuUnfold;
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );

  // Effect
  // When the user changes the mode, call out to the window.less object.
  React.useEffect(() => {
    changeMode(theme);
  }, [theme]);

  // Effect
  // On initial load, open up a connection to the server.
  React.useEffect(() => {
    if (isConnectionEnabled) {
      SocketClient.connect();
    } else {
      SocketClient.disconnect();
    }
  }, [isConnectionEnabled]);

  return (
    <>
      <GlobalStyles />
      <S.Layout className="layout" mode={theme}>
        {breakpoint.lg ? (
          // Desktop  sider
          <S.Sider width={300} mode={theme}>
            <Logo />
            <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
            <AppMenu />
          </S.Sider>
        ) : (
          // Mobile header
          <>
            <S.Header>
              <MobileMenuIcon onClick={toggleMobileMenu} />
              <Logo />
            </S.Header>
            {mobileMenuActive && (
              <S.MobileMenu>
                <S.AppMenu onItemClick={closeMobileMenu} />
              </S.MobileMenu>
            )}
          </>
        )}
        <AppHeader />
        <Content>
          <S.Page extraPadded={breakpoint.sm}>
            <RouterSwitch>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} exact={route.exact}>
                  {route.screen}
                </Route>
              ))}
            </RouterSwitch>

            {activePage && <Drawer page={activePage} />}
          </S.Page>
        </Content>
      </S.Layout>
    </>
  );
}

const S = {
  Affix: styled(Affix)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  `,
  Layout: styled(Layout)<{ mode: string }>`
    background: ${(props) =>
      props.theme.modes[props.mode].layoutBodyBackground};

    [role="tab"],
    .ant-form-item-no-colon {
      text-transform: uppercase;
      font-weight: bold;
    }

    .ant-typography {
      color: ${(props) => props.theme.modes[props.mode].textColor};
    }
    .ant-menu {
      background: ${(props) => props.theme.modes[props.mode].menuBg};
      border-right: none;

      &-item {
        padding-left: 24px !important;
        border-right: none;

        a {
          color: ${(props) => props.theme.modes[props.mode].menuItemColor};
        }
      }
    }
    .ant-collapse {
      border: 1px solid
        ${(props) => props.theme.modes[props.mode].collapseBorderColor};
      border-bottom: none !important;
      border-radius: 0 !important;
      padding-bottom: 0;

      &-header {
        background: ${(props) =>
          props.theme.modes[props.mode].collapseHeaderBg};
        border-radius: 0;
        border-bottom: 1px solid
          ${(props) => props.theme.modes[props.mode].collapseBorderColor} !important;
        color: ${(props) => props.theme.modes[props.mode].textColor} !important;
      }
      &-content {
        background: ${(props) =>
          props.theme.modes[props.mode].collapseContentBg};
        border-top: none;
        border-bottom: 1px solid
          ${(props) => props.theme.modes[props.mode].collapseBorderColor} !important;
        color: ${(props) => props.theme.modes[props.mode].textColor} !important;
      }
      &-item {
        border-bottom: none;
      }
    }
    .ant-statistic {
      &-header {
        color: ${(props) => props.theme.modes[props.mode].textColor} !important;
      }
      &-content {
        color: ${(props) => props.theme.modes[props.mode].textColor} !important;
      }
    }
    .ant-layout {
      &-header {
        border-bottom: 1px solid
          ${(props) => props.theme.modes[props.mode].layoutHeaderBorderColor} !important;
      }
      &-sider {
        &-children {
          border-right: 1px solid
            ${(props) => props.theme.modes[props.mode].layoutHeaderBorderColor} !important;
        }
      }
    }
  `,
  SocialMediaImage: styled.img`
    ${(props) => props.theme.snippets.size32};
    ${(props) => props.theme.snippets.circular};
  `,
  Rights: styled.div`
    margin-top: ${(props) => props.theme.spacing.small};
  `,
  Page: styled.div<{ extraPadded?: boolean }>`
    padding: ${(props) =>
      props.extraPadded
        ? props.theme.spacing.large
        : props.theme.spacing.small};
    ${(props) => props.theme.snippets.dropshadow};
    position: relative;
    padding-top: 112px;
  `,
  Breadcrumb: styled(Breadcrumb)`
    flex: 1;
  `,
  Header: styled(Header)`
    top: 0;
    ${(props) => props.theme.snippets.spacedBetween};
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
  MenuFold: styled(AiOutlineMenuFold)`
    font-size: 24px;
  `,
  MenuUnfold: styled(AiOutlineMenuUnfold)`
    font-size: 24px;
  `,
  MobileMenu: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: calc(100vw + 1px);
    height: 100vh;
    z-index: 2;
  `,
  Sider: styled(Sider)<{ mode: string }>`
    height: 100vh;

    .ant-layout-sider-children {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: 299px;
      overflow: auto;

      .ant-menu-sub {
        max-height: 300px;
        overflow: auto;
      }

      // Theme
      background: ${(props) =>
        props.theme.modes[props.mode].layoutSiderBackground};
      color: ${(props) => props.theme.modes[props.mode].layoutSiderColor};
    }
  `,
};
