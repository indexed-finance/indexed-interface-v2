import { AppHeader } from "./AppHeader";
import { AppMenu } from "./AppMenu";
import { BuildingWall } from "components";
import { Button, Layout, notification } from "antd";
import { CSSTransition } from "react-transition-group";
import { Helmet } from "react-helmet";
import { Logo } from "components";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Route, Switch as RouterSwitch } from "react-router-dom";
import { SocketClient } from "sockets/client";
import { Suspense } from "react";
import { routes } from "./routes";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import { useStorageEntry } from "hooks";
import { useTranslation } from "i18n";
import { useWalletConnectionDrawer } from "./drawers";
import noop from "lodash.noop";

const ERROR_NOTIFICATION_STORAGE_KEY =
  "indexed.finance | Last Showed Error Notification";
const TIME_BETWEEN_SERVER_ERROR_NOTIFICATIONS = 1000 * 60 * 60 * 3; // Three hours.

const { Sider, Content } = Layout;

export function AppLayout() {
  const tx = useTranslation();
  const { entry: lastNotifiedOfError, store } = useStorageEntry(
    ERROR_NOTIFICATION_STORAGE_KEY,
    -1
  );
  const isConnectionEnabled = useSelector(selectors.selectConnectionEnabled);
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);
  const breakpoints = useBreakpoints();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuActive(false), []);
  const { openDrawer } = useWalletConnectionDrawer();
  const toggleMobileMenu = useCallback(
    () => setMobileMenuActive((prev) => !prev),
    []
  );
  const theme = useSelector(selectors.selectTheme);

  // Effect
  // On initial load, open up a connection to the server.
  useEffect(() => {
    if (isConnectionEnabled) {
      SocketClient.connect(() => {
        const shouldNotify =
          lastNotifiedOfError === -1 ||
          Date.now() - lastNotifiedOfError >
            TIME_BETWEEN_SERVER_ERROR_NOTIFICATIONS;

        if (shouldNotify) {
          notification.error({
            message: tx("ERROR"),
            description: tx("UNABLE_TO_CONNECT_TO_SERVER_..."),
          });

          store(Date.now());
        }
      });
    } else {
      SocketClient.disconnect();
    }

    return () => {
      SocketClient.disconnect();
    };
  }, [isConnectionEnabled, lastNotifiedOfError, store, tx]);

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
            {indexPools.length > 0 ? null : (
              <div className="QuotePlaceholder perfectly-centered">
                <Button type="primary" onClick={openDrawer}>
                  {tx("CONNECT_YOUR_WALLET")}
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
                        <Suspense
                          fallback={
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Logo withTitle={false} spinning={true} />
                            </div>
                          }
                        >
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
