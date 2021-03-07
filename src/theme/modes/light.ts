// LIGHT
import S from "string";
import colors from "../colors";

const primary = colors.purple200;
const white = colors.white100;
const text = colors.black200;

const mode: Record<string, string> = {
  "@primary-color": primary,
  "@secondary-color": colors.black200,
  "@text-color": colors.black200,
  "@text-color-secondary": colors.black200,
  "@body-background": colors.black200,
  "@component-background": colors.grey100,
  "@layout-body-background": colors.black250,
  "@layout-header-color": text,
  "@layout-sider-background": colors.white200,
  "@layout-sider-color": text,
  "@layout-header-background": colors.purple100,
  "@menu-bg": colors.white300,
  "@menu-item-color": text,
  "@menu-dark-inline-submenu-bg": colors.grey100,
  "@collapse-header-bg": colors.grey100,
  "@collapse-border-color": colors.grey100,
  "@collapse-content-bg": colors.grey100,
  "@heading-color": colors.black200,
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
