const fs = require("fs");
const path = require("path");
const translationDirectory = path.join(__dirname, "../src/i18n/translations");

try {
  console.info("Alphabetizing translations...");

  for (const file of fs.readdirSync(translationDirectory)) {
    const filePath = path.join(translationDirectory, file);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContents);
    const sorted = abcSortObject(parsed);
    const serialized = JSON.stringify(sorted, null, 2);

    fs.writeFileSync(filePath, serialized);
  }

  console.info("Successfully alphabetized translations.");
} catch (error) {
  console.info("Unable to alphabetize translations", error);
}

// #region Helpers
function abcSortObject(object) {
  return Object.keys(object)
    .sort()
    .reduce((prev, next) => {
      prev[next] = object[next];

      return prev;
    }, {});
}
// #endregion
