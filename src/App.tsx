import {
  BadNetworkDrawer,
  DEBUG,
  DrawerProvider,
  ErrorBoundary,
  LayoutHeader,
  Page,
  TooltipProvider,
  TransactionList,
  useDiligenceDrawer,
  useTooltips,
} from "components";
import { BrowserRouter, Route, useLocation } from "react-router-dom";
import { FEATURE_FLAGS } from "feature-flags";
import { Layout, message, notification } from "antd";
import { NETWORKS_BY_ID } from "./config/network";
import { Provider } from "react-redux";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { routes } from "routes";
import { store } from "features";
import { useBreakpoints, useChainId, useWalletConnection } from "hooks";

export function getLibrary(_provider?: any, _connector?: any) {
  return new ethers.providers.Web3Provider(_provider, "any");
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
  const network = useChainId();
  const badNetwork = useMemo(() => !NETWORKS_BY_ID[network], [network]);
  const inner = (
    <>
      <LayoutHeader />
      <Layout.Content
        className="with-background"
        style={{ minHeight: "100vh", paddingTop: 1, paddingBottom: 12 }}
      >
        {badNetwork ? (
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
