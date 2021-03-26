import { AppState, store } from "features";
import fs from "fs";
import path from "path";

const STATE_FILE = path.join(__dirname, "./saved-state.json");
const ERROR_FILE = path.join(__dirname, "./error.log");

export function saveState() {
  try {
    const state = store.getState();

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), {
      encoding: "utf-8",
    });
  } catch (error) {
    fs.writeFileSync(
      ERROR_FILE,
      `Unable to save state.\n${JSON.stringify(error, null, 2)}`,
      {
        encoding: "utf-8",
      }
    );
  }
}

export function loadState() {
  try {
    const savedState = fs.readFileSync(STATE_FILE, {
      encoding: "utf-8",
    });
    const state = JSON.parse(savedState) as AppState;

    return state;
  } catch {}
}
