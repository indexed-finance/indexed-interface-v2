import { batcherReducer } from "./batcher";
import { categoriesReducer } from "./categories";
import { combineReducers } from "@reduxjs/toolkit";
import { dailySnapshotsReducer } from "./dailySnapshots";
import { indexPoolsReducer } from "./indexPools";
import { pairsReducer } from "./pairs";
import { settingsReducer } from "./settings";
import { tokensReducer } from "./tokens";
import { userReducer } from "./user";

export default combineReducers({
  batcher: batcherReducer,
  categories: categoriesReducer,
  dailySnapshots: dailySnapshotsReducer,
  indexPools: indexPoolsReducer,
  settings: settingsReducer,
  tokens: tokensReducer,
  user: userReducer,
  pairs: pairsReducer,
});
