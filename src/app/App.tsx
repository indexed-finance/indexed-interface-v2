import "theme/index.less";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { AppLayout } from "./AppLayout";
import { BrowserRouter } from "react-router-dom";
import { DEBUG } from "components";
import { FEATURE_FLAGS } from "feature-flags";
import { Parallax } from "react-parallax";
import { Provider, useSelector } from "react-redux";
import { WalletConnectProvider } from "./drawers";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import { message, notification } from "antd";
import { selectors, store } from "features";
import { useBreakpoints } from "helpers";
import { useEffect } from "react";
import background from "assets/images/dark-bg.jpg";

function Inner() {
  const { isMobile } = useBreakpoints();
  const theme = useSelector(selectors.selectTheme);
  const inner = (
    <>
      <BrowserRouter>
        <AppLayout />
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

  return theme === "outrun" ? (
    <Parallax bgImage={background} bgImageAlt="background" strength={200}>
      {inner}
    </Parallax>
  ) : (
    inner
  );
}

export function App() {
  return (
    <Provider store={store}>
      <AppErrorBoundary>
        <Web3ReactProvider getLibrary={getLibrary}>
          <WalletConnectProvider>
            <Inner />
          </WalletConnectProvider>
        </Web3ReactProvider>
      </AppErrorBoundary>
    </Provider>
  );
}

// #region Helpers
function getLibrary(_provider?: any, _connector?: any) {
  return new ethers.providers.Web3Provider(_provider);
}

// #endregion
