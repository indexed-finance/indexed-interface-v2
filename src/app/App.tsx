import { BrowserRouter } from "react-router-dom";
import { DrawerProvider } from "components";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { notification } from "antd";
import { store } from "features";
import AppLayout from "./AppLayout";
import React from "react";
import getTheme from "theme";

notification.config({
  placement: "topRight",
  top: 66,
  duration: 4.2,
});

function Inner() {
  const theme = getTheme();

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
