import darkMode from "./dark";
import lightMode from "./light";

export default function changeMode(to: "dark" | "light") {
  const lookup = {
    dark: darkMode,
    light: lightMode,
  };
  const modifiedVariables = lookup[to];

  (window as any).less.modifyVars(modifiedVariables);
}
