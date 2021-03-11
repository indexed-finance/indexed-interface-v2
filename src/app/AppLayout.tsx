import { Drawer, DrawerContext, QuoteCarousel } from "components";
import { FormattedIndexPool, selectors } from "features";
import { Layout } from "antd";
import { Logo } from "components";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import React, { useContext, useEffect } from "react";
import SocketClient from "sockets/client";
import routes from "./routes";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const { activePage } = useContext(DrawerContext);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const breakpoints = useBreakpoints();

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
    <Layout className="layout">
      <AppHeader />
      {breakpoints.lg && (
        // Desktop  sider
        <Sider width={300}>
          <Logo />
          <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
          <AppMenu />
        </Sider>
      )}
      <Content>
        <div>
          <RouterSwitch>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} exact={route.exact}>
                {route.screen}
              </Route>
            ))}
          </RouterSwitch>
          {activePage && <Drawer page={activePage} />}
        </div>
      </Content>
    </Layout>
  );
}
