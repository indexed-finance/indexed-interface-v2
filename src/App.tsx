import { BrowserRouter } from "react-router-dom";
import { DEBUG, ErrorBoundary, Screen } from "components";
import { DrawerProvider } from "components";
import { FEATURE_FLAGS } from "feature-flags";
import { Provider } from "react-redux";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { message, notification } from "antd";
import { store } from "features";
import { useBreakpoints } from "hooks";
import { useEffect } from "react";

export function getLibrary(_provider?: any, _connector?: any) {
  return new ethers.providers.Web3Provider(_provider);
}

export function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ErrorBoundary>
          <Web3ReactProvider getLibrary={getLibrary}>
            <DrawerProvider>
              <AppInner />
            </DrawerProvider>
          </Web3ReactProvider>
        </ErrorBoundary>
      </Provider>
    </BrowserRouter>
  );
}

export function AppInner() {
  const { isMobile } = useBreakpoints();
  const inner = (
    <>
      <BrowserRouter>
        <Screen />
      </BrowserRouter>
      {FEATURE_FLAGS.useDEBUG && <DEBUG />}
    </>
  );

  // Effect:
  // Configure antd notifications and messages.
  useEffect(() => {
    message.config({
      top: isMobile ? 106 : 66,
      duration: 4.2,
    });

    notification.config({
      placement: "topRight",
      top: isMobile ? 106 : 66,
      duration: 4.2,
    });
  }, [isMobile]);

  return inner;
}
