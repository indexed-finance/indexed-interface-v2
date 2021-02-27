const path = require("path");
const fs = require("fs").promises;
const webpack = require("webpack");
const config = require("../webpack/webpack.config");

(async () => {
  // When building the server, we need to modify the tsconfig.json to reduce emissions.
  const tsconfigPath = path.resolve(__dirname, "../tsconfig.json");
  const tsconfig = await fs.readFile(tsconfigPath, {
    encoding: "utf8",
  });
  const parsed = JSON.parse(tsconfig);

  parsed.compilerOptions.noEmit = false;

  await fs.writeFile(tsconfigPath, JSON.stringify(parsed, null, 2));

  // Now, run Webpack and wait for it to run.
  const compiler = webpack(config);

  try {
    await new Promise((resolve, reject) =>
      compiler.run((err) => (err ? reject(err) : resolve()))
    );

    parsed.compilerOptions.noEmit = true;

    await fs.writeFile(tsconfigPath, JSON.stringify(parsed, null, 2));

    console.info("Finished building server.");
  } catch (error) {
    console.error("Unable to build server.", error);
    process.exit(1);
  }

  // Finally, replace the original config.
})();
