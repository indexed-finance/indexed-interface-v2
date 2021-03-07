// DARK
import S from "string";
import colors from "../colors";

const primary = colors.purple200;
const white = colors.white100;
const text = colors.white100;

const mode: Record<string, string> = {
  "@primary-color": primary,
  "@secondary-color": colors.black200,
  "@text-color": white,
  "@text-color-secondary": white,
  "@body-background": colors.black200,
  "@component-background": colors.grey100,
  "@layout-body-background": colors.black200,
  "@layout-sider-background": colors.black300,
  "@layout-header-background": colors.black300,
  "@layout-header-border-color": colors.purple100,
  "@menu-bg": colors.black250,
  "@menu-item-color": text,
  "@menu-dark-inline-submenu-bg": colors.grey100,
  "@collapse-header-bg": colors.black200,
  "@collapse-border-color": colors.grey100,
  "@collapse-content-bg": colors.black300,
  "@heading-color": white,
  "@border-color-base": primary,
  "@border-color-split": primary,
  "@menu-dark-selected-item-text-color": white,
  "@breadcrumb-base-color": white,
  "@breadcrumb-last-item-color": colors.purple300,
  "@breadcrumb-separator-color": white,
};

// Add aliases for easier reference in styled-components
for (const [key, value] of Object.entries(mode)) {
  // @primary-color -> primaryColor
  const alias = S(key.replace(/@/g, "")).camelize().s;

  mode[alias] = value;
}

export default mode;
