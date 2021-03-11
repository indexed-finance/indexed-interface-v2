import { useBreakpoints } from "helpers";
import colors from "./colors";
import snippets from "./snippets";
import variables from "./variables";

export { default as GlobalStyles } from "./global";

export { colors };

export default function useTheme(mode: "dark" | "light") {
  const { isMobile, ...breakpoints } = useBreakpoints();

  return {
    isMobile,
    mode,
    colors,
    snippets,
    breakpoints,
    ...variables,
  };
}
