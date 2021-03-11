import { BrowserRouter } from "react-router-dom";
import { DEBUGScreenSize, DrawerProvider } from "components";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider } from "styled-components";
import { notification } from "antd";
import { selectors, store } from "features";
import AppLayout from "./AppLayout";
import React from "react";
import flags from "feature-flags";
import useTheme from "theme";

notification.config({
  placement: "topRight",
  top: 66,
  duration: 4.2,
});

function Inner() {
  const themeInStore = useSelector(selectors.selectTheme);
  const theme = useTheme(themeInStore);

  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DrawerProvider>
            <AppLayout />
          </DrawerProvider>
        </ThemeProvider>
      </BrowserRouter>
      {flags.showScreenSize && <DEBUGScreenSize />}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
