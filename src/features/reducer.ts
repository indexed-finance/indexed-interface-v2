import {
  categoriesReducer,
  dailySnapshotsReducer,
  indexPoolsReducer,
  tokensReducer,
} from "./models";
import { combineReducers } from "@reduxjs/toolkit";
import { settingsReducer } from "./settings";

export default combineReducers({
  categories: categoriesReducer,
  dailySnapshots: dailySnapshotsReducer,
  indexPools: indexPoolsReducer,
  settings: settingsReducer,
  tokens: tokensReducer,
});
