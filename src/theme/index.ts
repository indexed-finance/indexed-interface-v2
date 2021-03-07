import { darkMode, lightMode } from "./modes";
import colors from "./colors";
import snippets from "./snippets";
import variables from "./variables";

export { default as GlobalStyles } from "./global";
export * from "./modes";

export default function getTheme() {
  return {
    colors,
    modes: {
      dark: darkMode,
      light: lightMode,
    },
    snippets,
    ...variables,
  };
}
