const fs = require("fs");
const path = require("path");

const sourceDirectory = path.join(__dirname, "../src");
const isSpecFile = (file) => file.includes("spec");
const isTypescriptFile = (file) => path.extname(file).includes("ts");
const isIndexFile = (file) => path.parse(file).name === "index";
const isValidFile = (file) =>
  isTypescriptFile(file) && ![isSpecFile, isIndexFile].some((fn) => fn(file));
const isBadExport = (_export) =>
  ["export * from './translations';", "export * from './local-data';"].includes(
    _export
  );
const createIndex = (directory) => {
  const indexFileEntries = fs
    .readdirSync(directory)
    .sort()
    .reduce(
      (prev, next) => {
        const { name } = path.parse(next);
        const fullPath = path.join(directory, next);
        const exportStatement = `export * from './${name}';`;
        const isDirectory = fs.statSync(fullPath).isDirectory();

        if (
          (isDirectory || isValidFile(fullPath)) &&
          !isBadExport(exportStatement)
        ) {
          prev.push(exportStatement);
        }

        if (isDirectory) {
          createIndex(fullPath);
        }

        return prev;
      },
      [
        "// This file was generated via a script in `scripts/`.",
        "// Do not manually modify this (or any) index files.\n",
      ]
    );

  directory !== sourceDirectory &&
    fs.writeFileSync(`${directory}/index.ts`, indexFileEntries.join("\n"));
};
const removeBadIndices = () =>
  [
    "assets",
    "assets/images",
    "assets/images/connectors",
    "assets/images/karate_files",
    "i18n",
    "theme",
    "theme/fonts",
    "sockets",
    "sockets/server",
  ].forEach((illegalPath) =>
    fs.unlinkSync(path.join(sourceDirectory, `${illegalPath}/index.ts`))
  );

try {
  console.info(`Creating index files for ${sourceDirectory}...`);

  createIndex(sourceDirectory);
  removeBadIndices();

  console.info(`All done.`);
} catch (error) {
  console.error(`Unable to create index files for ${sourceDirectory}.`, error);
}
