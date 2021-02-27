import { categoriesReducer } from "./categories";
import { dailySnapshotsReducer } from "./dailySnapshots";
import { indexPoolsReducer } from "./indexPools";
import { tokensReducer } from "./tokens";

import { combineReducers } from "@reduxjs/toolkit";
import { settingsReducer } from "./settings";

export default combineReducers({
  categories: categoriesReducer,
  dailySnapshots: dailySnapshotsReducer,
  indexPools: indexPoolsReducer,
  settings: settingsReducer,
  tokens: tokensReducer,
});
