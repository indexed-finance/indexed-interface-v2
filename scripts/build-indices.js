const fs = require("fs");
const path = require("path");

const sourceDirectory = path.join(__dirname, "../src");
const ignoreDirs = [
  "images",
  "i18n",
  "theme",
  "theme/fonts",
  "theme/images",
  "sockets",
  "sockets/server",
  "ethereum/abi",
  "data",
  "data/learn",
  "libs",
  "libs/@walletconnect-connector",
].map((dir) => path.join(sourceDirectory, dir));
const isSpecFile = (file) => file.includes("spec");
const isTypescriptFile = (file) => path.extname(file).includes("ts");
const isIndexFile = (file) => path.parse(file).name === "index";
const isValidFile = (file) =>
  isTypescriptFile(file) && ![isSpecFile, isIndexFile].some((fn) => fn(file));
const shouldBuildIndex = (_path) => !ignoreDirs.includes(_path);
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

        if (isDirectory && shouldBuildIndex(fullPath)) {
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

try {
  console.info(`Creating index files for ${sourceDirectory}...`);

  createIndex(sourceDirectory);

  console.info(`All done.`);
} catch (error) {
  console.error(`Unable to create index files for ${sourceDirectory}.`, error);
}
