import colors from "./colors";
import snippets from "./snippets";
import variables from "./variables";

export { default as GlobalStyles } from "./global";

export default function getTheme() {
  return {
    colors,
    snippets,
    ...variables,
  };
}
