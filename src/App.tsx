import {
  BadNetworkDrawer,
  DEBUG,
  DrawerProvider,
  ErrorBoundary,
  LayoutHeader,
  Navigation,
  Page,
  TooltipProvider,
  TransactionList,
  WarningBar,
  useDiligenceDrawer,
  useTooltips,
} from "components";
import { BrowserRouter, Route, useLocation } from "react-router-dom";
import { FEATURE_FLAGS } from "feature-flags";
import { Layout, message, notification } from "antd";
import { Provider, useSelector } from "react-redux";
import { Suspense, useEffect, useRef } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { routes } from "routes";
import { selectors, store } from "features";
import { useBreakpoints, useWalletConnection } from "hooks";
import ReactGA from "react-ga";

const GOOGLE_ANALYTICS_TRACKING_CODE = "G-MHCR3CSH7C";

export function getLibrary(_provider?: any, _connector?: any) {
  return new ethers.providers.Web3Provider(_provider);
}

// Effect:
// Run Google Analytics when user loads the production site.
export function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_CODE);
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <ErrorBoundary>
          <Web3ReactProvider getLibrary={getLibrary}>
            <TooltipProvider>
              <DrawerProvider>
                <AppLayout />
              </DrawerProvider>
            </TooltipProvider>
          </Web3ReactProvider>
        </ErrorBoundary>
      </Provider>
    </BrowserRouter>
  );
}

export function AppLayout() {
  const { scan } = useTooltips();
  const { pathname } = useLocation();
  const previousLocation = useRef(pathname);
  const { isMobile } = useBreakpoints();
  const onBadNetwork = useSelector(selectors.selectBadNetwork);
  const inner = (
    <>
      <LayoutHeader />
      <WarningBar />
      <Layout.Content
        className="with-background"
        style={{ minHeight: "100vh", paddingTop: 1, paddingBottom: 12 }}
      >
        {onBadNetwork ? (
          <Page hasPageHeader={false}>
            <BadNetworkDrawer />
          </Page>
        ) : (
          <Suspense fallback={<Page hasPageHeader={false} />}>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                component={route.component}
              />
            ))}
          </Suspense>
        )}
      </Layout.Content>
      <TransactionList />
      {isMobile && (
        <Layout.Footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            background: "#151515",
            borderTop: "1px solid #49ffff",
            padding: 12,
            zIndex: 10,
          }}
        >
          <Navigation />
        </Layout.Footer>
      )}
      {FEATURE_FLAGS.useDEBUG && <DEBUG />}
    </>
  );

  useDiligenceDrawer();
  useWalletConnection();

  // Effect:
  // Configure antd notifications and messages.
  useEffect(() => {
    message.config({
      top: isMobile ? 136 : 96,
      duration: 4.2,
    });

    notification.config({
      placement: "topRight",
      top: isMobile ? 96 : 96,
      duration: 4.2,
    });
  }, [isMobile]);

  useEffect(() => {
    if (pathname !== previousLocation.current) {
      previousLocation.current = pathname;
      window.scrollTo({
        top: 0,
      });
      scan();
    }
  });

  return inner;
}
