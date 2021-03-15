const path = require("path");
const fs = require("fs").promises;
const { generateTheme } = require("antd-theme-generator");

const theme = process.env.THEME;

if (!["dark", "light"].includes(theme)) {
  console.error(
    "The build-themes script requires an environment variable of either >dark< or >light<."
  );
  process.exit();
}

const options = {
  stylesDir: path.join(__dirname, "../src/theme"),
  antDir: path.join(__dirname, "../node_modules/antd"),
  varFile: path.join(__dirname, `../src/theme/variables-${theme}.less`),
  mainLessFile: path.join(__dirname, "../src/theme/index.less"),
  themeVariables: [
    "@first",
    "@second",
    "@third",
    "@fourth",
    "@primary-color",
    "@secondary-color",
    "@heading-color",
    "@text-color",
    "@layout-header-background",
    "@processing-color",
  ],
  indexFileName: "index.html",
  outputFilePath: path.join(__dirname, `../public/${theme}.less`),
};

(async () => {
  try {
    await generateTheme(options);

    // After generating the style, wrap it in a class selector for toggling.
    const filePath = path.join(__dirname, `../public/${theme}.less`);
    const file = await fs.readFile(filePath, {
      encoding: "utf8",
    });

    const prefixedFile = `
.${theme} {
  ${file}
}
`;

    await fs.writeFile(filePath, prefixedFile, {
      encoding: "utf8",
    });
  } catch (error) {
    console.error(`Unable to build ${theme} theme.`, error);
  }
})();
