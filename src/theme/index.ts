import colors from "./colors";
import snippets from "./snippets";
import variables from "./variables";

export { default as GlobalStyles } from "./global";

export default function getTheme(mode: "dark" | "light") {
  return {
    mode,
    colors,
    snippets,
    ...variables,
  };
}
