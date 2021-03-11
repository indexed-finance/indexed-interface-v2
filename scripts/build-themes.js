const path = require("path");
const { generateTheme } = require("antd-theme-generator");

const options = {
  stylesDir: path.join(__dirname, "../src/theme"),
  antDir: path.join(__dirname, "../node_modules/antd"),
  varFile: path.join(__dirname, "../src/theme/variables.less"),
  mainLessFile: path.join(__dirname, "../src/theme/index.less"),
  themeVariables: ["@primary-color"],
  indexFileName: "index.html",
  outputFilePath: path.join(__dirname, "../public/color.less"),
};

generateTheme(options)
  .then((less) => {
    console.log("Theme generated successfully");
  })
  .catch((error) => {
    console.log("Error", error);
  });
