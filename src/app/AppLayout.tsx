import { Affix, Breadcrumb, Layout } from "antd";
import { Drawer, DrawerContext, QuoteCarousel } from "components";
import { FormattedIndexPool, selectors } from "features";
import { GlobalStyles } from "theme";
import { Logo } from "components";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import React, { useContext, useEffect, useRef } from "react";
import SocketClient from "sockets/client";
import routes from "./routes";
import styled, { css } from "styled-components";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const { activePage } = useContext(DrawerContext);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const theme = useSelector(selectors.selectTheme);
  const breakpoints = useBreakpoints();
  const originalMode = useRef(theme);
  const modeWrapper = useRef(
    require(`./modes/${theme === "dark" ? "Dark" : "Light"}ModeWrapper.tsx`)
      .default
  );
  const ModeWrapper = modeWrapper.current ?? "div";

  // Effect
  // When the user changes the mode, call out to the window.less object.
  useEffect(() => {
    if (window && theme !== originalMode.current) {
      window.location.reload();
    }
  }, [theme]);

  // Effect
  // On initial load, open up a connection to the server.
  useEffect(() => {
    if (isConnectionEnabled) {
      SocketClient.connect();
    } else {
      SocketClient.disconnect();
    }

    return () => {
      SocketClient.disconnect();
    };
  }, [isConnectionEnabled]);

  return (
    <ModeWrapper className={theme}>
      <GlobalStyles />
      <S.Layout className="layout">
        {breakpoints.lg && (
          // Desktop  sider
          <S.Sider width={300}>
            <Logo />
            <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
            <AppMenu />
          </S.Sider>
        )}
        <AppHeader />
        <S.Content>
          {/* Dull the background image */}
          <S.Screen className="ant-layout-screen" />
          <S.Page extraPadded={breakpoints.xs} isMobile={!breakpoints.md}>
            <RouterSwitch>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} exact={route.exact}>
                  {route.screen}
                </Route>
              ))}
            </RouterSwitch>
            {activePage && <Drawer page={activePage} />}
          </S.Page>
        </S.Content>
      </S.Layout>
    </ModeWrapper>
  );
}

const S = {
  Affix: styled(Affix)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  `,
  Layout: styled(Layout)``,
  SocialMediaImage: styled.img`
    ${(props) => props.theme.snippets.size32};
    ${(props) => props.theme.snippets.circular};
  `,
  Rights: styled.div`
    margin-top: ${(props) => props.theme.spacing.small};
  `,
  Page: styled.div<{ extraPadded?: boolean; isMobile: boolean }>`
    padding: ${(props) =>
      props.extraPadded
        ? props.theme.spacing.large
        : props.theme.spacing.small};
    ${(props) => props.theme.snippets.dropshadow};
    position: relative;
    ${(props) =>
      !props.isMobile &&
      css`
        padding-top: 112px;
      `}
  `,
  Breadcrumb: styled(Breadcrumb)`
    flex: 1;
  `,
  Sider: styled(Sider)`
    height: 100vh;

    .ant-layout-sider-children {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: 299px;
      height: 100vh;
      overflow: auto;

      .ant-menu-sub {
        max-height: 300px;
        overflow: auto;
      }
    }
  `,
  Content: styled(Content)`
    position: relative;
  `,
  Screen: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,
};
