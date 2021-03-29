import "theme/index.less";
import { BrowserRouter } from "react-router-dom";
import { DEBUG } from "components";
import { Parallax } from "react-parallax";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Web3ReactProvider } from "@web3-react/core";
import { actions, selectors, store } from "features";
import { ethers } from "ethers";
import { message, notification } from "antd";
import { useBreakpoints } from "helpers";
import { useEffect, useRef } from "react";
import AppErrorBoundary from "./AppErrorBoundary";
import AppLayout from "./AppLayout";
import background from "assets/images/dark-bg.jpg";
import flags from "feature-flags";

function Inner() {
  const dispatch = useDispatch();
  const { isMobile } = useBreakpoints();
  const theme = useSelector(selectors.selectTheme);
  const userAddress = useSelector(selectors.selectUserAddress);
  const initiallyLoadedUser = useRef(false);

  const inner = (
    <>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      {flags.useDEBUG && <DEBUG />}
    </>
  );

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

  useEffect(() => {
    if (!initiallyLoadedUser.current && userAddress) {
      initiallyLoadedUser.current = true;
      dispatch(actions.attachToProvider());
    }
  }, [dispatch, userAddress]);

  return theme === "outrun" ? (
    <Parallax bgImage={background} bgImageAlt="background" strength={200}>
      {inner}
    </Parallax>
  ) : (
    inner
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppErrorBoundary>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Inner />
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
