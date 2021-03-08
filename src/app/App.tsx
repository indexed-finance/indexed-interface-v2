import { DrawerProvider } from "components";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { store } from "features";
import AppLayout from "./AppLayout";
import React from "react";
import getTheme from "theme";

function Inner() {
  const theme = getTheme();

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
