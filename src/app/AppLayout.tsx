import { BuildingWall, QuoteCarousel } from "components";
import { Button, Layout } from "antd";
import { CSSTransition } from "react-transition-group";
import { FormattedIndexPool, actions, selectors } from "features";
import { Helmet } from "react-helmet";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import SocketClient from "sockets/client";
import routes from "./routes";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const dispatch = useDispatch();
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
      </Helmet>

      <Layout className="AppLayout">
        <CSSTransition
          in={mobileMenuActive}
          timeout={200}
          classNames="AppMenuAnimation"
          unmountOnExit={true}
        >
          <div className="AppMenuWrapper">
            <AppMenu onItemClick={closeMobileMenu} />
          </div>
        </CSSTransition>

        <AppHeader
          mobileMenuActive={mobileMenuActive}
          onToggleMobileMenu={toggleMobileMenu}
        />

        <div className="top-left-corner" />

        <BuildingWall top={0} left={300} windows={false} zIndex={0} />
        <BuildingWall top={284} left={300} zIndex={0} />
        <BuildingWall top={0} right={-220} zIndex={2} />

        {breakpoints.lg && (
          <Sider width={300}>
            {indexPools.length > 0 ? (
              <QuoteCarousel pools={indexPools as FormattedIndexPool[]} />
            ) : (
              <div className="QuotePlaceholder perfectly-centered">
                <Button
                  type="primary"
                  onClick={() => dispatch(actions.attachToProvider())}
                >
                  Connect wallet
                </Button>
              </div>
            )}
            <AppMenu />
          </Sider>
        )}

        <Content style={{ paddingRight: 10, paddingLeft: 10 }}>
          <div className="Page">
            {!breakpoints.isMobile && (
              <>
                <div className="page-top-wall" />
                <div className="page-side-wall" />
              </>
            )}

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
