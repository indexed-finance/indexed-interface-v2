const fs = require("fs");
const path = require("path");

const sourceDirectory = path.join(__dirname, "../src");
const isSpecFile = (file) => file.includes("spec");
const isTypescriptFile = (file) => path.extname(file).includes("ts");
const isIndexFile = (file) => path.parse(file).name === "index";
const isValidFile = (file) =>
  isTypescriptFile(file) && ![isSpecFile, isIndexFile].some((fn) => fn(file));
const createIndex = (directory) => {
  const indexFileEntries = [
    "// This file was generated via a script in `scripts/`.",
    "// Do not manually modify this (or any) index files.\n",
  ];

  fs.readdirSync(directory).forEach((fileOrDirectory) => {
    const fullPath = path.join(directory, fileOrDirectory);

    fs.statSync(fullPath).isDirectory()
      ? createIndex(fullPath)
      : isValidFile(fullPath) &&
        indexFileEntries.push(
          `export * from './${path.parse(fileOrDirectory).name}';`
        );
  });

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
