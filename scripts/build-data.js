const path = require("path");
const fs = require("fs").promises;

const DATA_INPUT_PATH = path.resolve(__dirname, "../data/");
const DATA_OUTPUT_PATH = path.resolve(__dirname, "../src/data.json");

async function recursivelyBuildData(
  inputPath = DATA_INPUT_PATH,
  returnedData = {},
  prefix = ""
) {
  try {
    console.info("Building data...");

    const directory = await fs.readdir(inputPath);

    for (const subdirectory of directory) {
      const filePath = path.join(inputPath, subdirectory);
      const [slug] = subdirectory.split("."); // 'foo.md' -> 'foo'

      // Subdirectories are models which have children.
      if ((await fs.stat(filePath)).isDirectory()) {
        returnedData[`${prefix}${slug}`] = await recursivelyBuildData(
          filePath,
          returnedData,
          prefix ? `${prefix}/${subdirectory}` : subdirectory
        );
      } else {
        // Top-level files are accessed in their own manner.
        returnedData[
          `${prefix ? `${prefix}/${slug}` : slug}`
        ] = await fs.readFile(path.join(inputPath, subdirectory), {
          encoding: "utf8",
        });
      }
    }

    await fs.writeFile(
      DATA_OUTPUT_PATH,
      JSON.stringify(returnedData, null, 2),
      {
        encoding: "utf8",
      }
    );

    console.info("Data built successfully.");
  } catch (error) {
    console.error("Unable to build data.", error);
  }
}

recursivelyBuildData();
