import { start } from "./start";
import cbFs from "fs";
import path from "path";

const { promises: fs } = cbFs;

const ERROR_LOG_PATH = path.join(__dirname, "../../../error-log.json");

export async function setupErrorHandling() {
  try {
    await readLogFile();
  } catch (error) {
    await writeLogFile([]);
  }

  process.on("uncaughtException", (error) => {
    const entry = {
      when: new Date().getTime(),
      error,
    };

    updateLogFile(entry);
    start();
  });

  process.on("unhandledRejection", (error) => {
    throw error;
  });
}

// #region Helpers
async function readLogFile() {
  return JSON.parse(
    await fs.readFile(ERROR_LOG_PATH, {
      encoding: "utf8",
    })
  );
}

function writeLogFile(unformatted: Record<string, any>) {
  return fs.writeFile(ERROR_LOG_PATH, JSON.stringify(unformatted, null, 2), {
    encoding: "utf8",
  });
}

async function updateLogFile(update: Record<string, any>) {
  try {
    const existing = await readLogFile();

    existing.shift(update);

    await writeLogFile(existing);
  } catch (error) {}
}
// #endregion
