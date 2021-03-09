import { BrowserRouter } from "react-router-dom";
import { DrawerProvider } from "components";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider } from "styled-components";
import { notification } from "antd";
import { selectors, store } from "features";
import AppLayout from "./AppLayout";
import React from "react";
import getTheme from "theme";

notification.config({
  placement: "topRight",
  top: 66,
  duration: 4.2,
});

function Inner() {
  const themeInStore = useSelector(selectors.selectTheme);
  const theme = getTheme(themeInStore);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <DrawerProvider>
          <AppLayout />
        </DrawerProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
