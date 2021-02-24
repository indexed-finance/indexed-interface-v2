import { DarkVariation as dark, LightVariation as light } from "./variations";
import colors from "./colors";
import snippets from "./snippets";
import variables from "./variables";

export { default as GlobalStyles } from "./global";

export default function getTheme(variation: "dark" | "light") {
  const relevantVariation = variation === "dark" ? dark : light;

  return {
    colors,
    snippets,
    ...relevantVariation,
    ...variables,
  };
}
