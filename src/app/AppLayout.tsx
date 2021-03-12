import { Drawer, DrawerContext, QuoteCarousel } from "components";
import { FormattedIndexPool, selectors } from "features";
import { Layout } from "antd";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import SocketClient from "sockets/client";
import routes from "./routes";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const { activePage } = useContext(DrawerContext);
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const breakpoints = useBreakpoints();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );

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
    <Layout className="AppLayout">
      <AppHeader
        mobileMenuActive={mobileMenuActive}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {(mobileMenuActive || breakpoints.lg) && (
        <Sider width={300}>
          <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
          <AppMenu onItemClick={closeMobileMenu} />
        </Sider>
      )}

      <Content>
        <div className="Page">
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
