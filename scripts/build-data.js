const fs = require("fs").promises;
const path = require("path");

const dataDirectory = path.join(__dirname, "../src/data/learn");

(async () => {
  const articles = (await fs.readdir(dataDirectory)).filter(
    (path) => path !== "index.ts"
  );
  const fileText = `export default [${articles
    .map((path) => `"${path}"`)
    .join(", ")}];\n`;

  await fs.writeFile(path.join(dataDirectory, "index.ts"), fileText, {
    encoding: "utf-8",
  });
})();
