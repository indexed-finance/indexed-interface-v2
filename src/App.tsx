import { BrowserRouter, Route, useLocation } from "react-router-dom";
import {
  DEBUG,
  DrawerProvider,
  ErrorBoundary,
  LayoutHeader,
  Navigation,
  Page,
  SocialMediaList,
  TooltipProvider,
  TransactionList,
  useTooltips,
} from "components";
import { FEATURE_FLAGS } from "feature-flags";
import { Layout, message, notification } from "antd";
import { Provider } from "react-redux";
import { Suspense, useEffect, useRef } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { routes } from "routes";
import { store } from "features";
import { useBreakpoints, useWalletConnection } from "hooks";

export function getLibrary(_provider?: any, _connector?: any) {
  return new ethers.providers.Web3Provider(_provider);
}

export function App() {
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
  const inner = (
    <>
      <LayoutHeader />
      <SocialMediaList />
      <Layout.Content
        className="with-background"
        style={{ minHeight: "100vh", paddingTop: 1 }}
      >
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
      </Layout.Content>
      <TransactionList />
      {isMobile && (
        <Layout.Footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            background: "#111",
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
      top: isMobile ? 136 : 96,
      duration: 4.2,
    });
  }, [isMobile]);

  useEffect(() => {
    if (pathname !== previousLocation.current) {
      previousLocation.current = pathname;
      scan();
    }
  });

  return inner;
}
