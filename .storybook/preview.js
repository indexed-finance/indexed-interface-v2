import React from "react";
import { ThemeProvider } from "styled-components";
import theme from "../src/theme";
import "../src/theme/typography.css";
import "./styles.css";

function Theming({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators = [
  (Story) => (
    <Theming>
      <Story />
    </Theming>
  ),
];
