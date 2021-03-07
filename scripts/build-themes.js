const path = require("path");
const { generateTheme } = require("antd-theme-generator");
const options = {
  stylesDir: path.join(__dirname, "../src/theme"),
  antDir: path.join(__dirname, "../node_modules/antd"),
  varFile: path.join(__dirname, "../src/theme/variables.less"),
  mainLessFile: path.join(__dirname, "../src/theme/index.less"),
  themeVariables: [
    "@white100",
    "@grey100",
    "@grey200",
    "@primary-color",
    "@secondary-color",
    "@text-color",
    "@text-color-secondary",
    "@body-background",
    "@component-background",
    "@layout-body-background",
    "@layout-header-background",
    "@menu-dark-inline-submenu-bg",
    "@collapse-header-bg",
    "@collapse-content-bg",
    "@heading-color",
    "@border-color-base",
    "@border-color-split",
    "@menu-dark-selected-item-text-color",
    "@breadcrumb-base-color",
    "@breadcrumb-last-item-color",
    "@breadcrumb-separator-color",
  ],
  indexFileName: "index.html",
  outputFilePath: path.join(__dirname, "../public/color.less"),
};

(async () => {
  try {
    await generateTheme(options);

    console.log("Successfully built themes.");
  } catch (error) {
    console.error(console.log("Failed to build themes.", error));
  }
})();
