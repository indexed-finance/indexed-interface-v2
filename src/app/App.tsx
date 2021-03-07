import { DrawerProvider } from "components";
import { Provider, useDispatch } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { actions, store } from "features";
import { ethers } from "ethers";
import AppLayout from "./AppLayout";
import React, { useEffect } from "react";
import getTheme from "theme";

function Inner() {
  const theme = getTheme();
  const dispatch = useDispatch();

  // Effect:
  // --
  useEffect(() => {
    const attachToProvider = async () => {
      const ethereum = (window as any).ethereum;

      if (ethereum) {
        const [selectedAddress] = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(ethereum, 1);

        (window as any).provider = provider;

        dispatch(
          actions.initialize({
            provider,
            selectedAddress,
            withSigner: true,
          })
        );
      }
    };
    attachToProvider();
  }, [dispatch]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <DrawerProvider>
          <AppLayout />
        </DrawerProvider>
      </ThemeProvider>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
