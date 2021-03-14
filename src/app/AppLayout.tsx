import { FormattedIndexPool, selectors } from "features";
import { Helmet } from "react-helmet";
import { Layout } from "antd";
import { QuoteCarousel } from "components";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import SocketClient from "sockets/client";
import routes from "./routes";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const breakpoints = useBreakpoints();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );
  const theme = useSelector(selectors.selectTheme);

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
    <>
      <Helmet>
        <body className={theme} />
        {breakpoints.isMobile && (
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, 
        user-scalable=0"
          />
        )}
      </Helmet>
      <Layout className="AppLayout">
        {mobileMenuActive && (
          <div className="AppMenuWrapper">
            <AppMenu onItemClick={closeMobileMenu} />
          </div>
        )}
        <AppHeader
          mobileMenuActive={mobileMenuActive}
          onToggleMobileMenu={toggleMobileMenu}
        />
        {breakpoints.lg && (
          <Sider width={300}>
            {indexPools.length > 0 && (
              <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
            )}
            <AppMenu />
          </Sider>
        )}
        <Content style={{ paddingRight: 10, paddingLeft: 10 }}>
          <div className="Page">
            <RouterSwitch>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} exact={route.exact}>
                  {route.screen}
                </Route>
              ))}
            </RouterSwitch>
          </div>
        </Content>
      </Layout>
    </>
  );
}
