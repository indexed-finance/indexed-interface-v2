import { DrawerProvider } from "components";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { actions, selectors, store } from "features";
import AppLayout from "./AppLayout";
import React, { useEffect } from "react";
import getTheme from "theme";

function Inner() {
  const themeVariation = useSelector(selectors.selectTheme);
  const theme = getTheme(themeVariation);
  const dispatch = useDispatch();

  // Effect:
  // --
  useEffect(() => {
    dispatch(actions.initialize());
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
