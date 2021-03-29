import { BuildingWall, QuoteCarousel } from "components";
import { Button, Layout, Spin } from "antd";
import { CSSTransition } from "react-transition-group";
import { FormattedIndexPool, actions, selectors } from "features";
import { Helmet } from "react-helmet";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { Suspense } from "react";
import { useBreakpoints } from "helpers";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "i18n";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import SocketClient from "sockets/client";
import noop from "lodash.noop";
import routes from "./routes";

const { Sider, Content } = Layout;

export default function AppLayout() {
  const translate = useTranslation();
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

        {theme === "outrun" && (
          <>
            <BuildingWall
              top={0}
              right={breakpoints.isMobile ? -295 : -220}
              zIndex={2}
            />

            {!breakpoints.isMobile && (
              <>
                <div className="top-left-corner" />
                <BuildingWall top={0} left={300} windows={false} zIndex={0} />
                <BuildingWall top={284} left={300} zIndex={0} />
              </>
            )}
          </>
        )}

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
                  {translate("DISCONNECT")}
                </Button>
              </div>
            )}
            <AppMenu />
          </Sider>
        )}

        <Content style={{ paddingRight: 10, paddingLeft: 10 }}>
          <AbovePageProvider>
            <div className="Page">
              {theme === "outrun" && (
                <>
                  <div className="page-top-wall" />
                  {!breakpoints.isMobile && <div className="page-side-wall" />}
                </>
              )}
              <RouterSwitch>
                {routes.map((route, index) => {
                  if (route.screen) {
                    const ScreenToShow = route.screen;

                    return (
                      <Route key={index} path={route.path} exact={route.exact}>
                        <Suspense fallback={<Spin />}>
                          <ScreenToShow />
                        </Suspense>
                      </Route>
                    );
                  } else {
                    return null;
                  }
                })}
              </RouterSwitch>
            </div>
          </AbovePageProvider>
        </Content>
      </Layout>
    </>
  );
}

// #region Helpers
export type AbovePageContextType = {
  setAbovePage(to: ReactNode): void;
  clearAbovePage(): void;
};

export const AbovePageContext = createContext<AbovePageContextType>({
  setAbovePage: noop,
  clearAbovePage: noop,
});

function AbovePageProvider({ children }: { children: ReactNode }) {
  const [abovePage, setAbovePage] = useState<ReactNode>(null);
  const clearAbovePage = useCallback(() => setAbovePage(null), []);
  const value = useMemo(
    () => ({
      setAbovePage,
      clearAbovePage,
    }),
    [setAbovePage, clearAbovePage]
  );

  return (
    <AbovePageContext.Provider value={value}>
      <div style={{ margin: "8rem 0 auto 10rem", width: 1240 }}>
        {abovePage}
      </div>
      {children}
    </AbovePageContext.Provider>
  );
}
// #endregion
