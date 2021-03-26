import { batcherReducer } from "./batcher";
import { cacheReducer } from "./cache";
import { categoriesReducer } from "./categories";
import { combineReducers } from "@reduxjs/toolkit";
import { dailySnapshotsReducer } from "./dailySnapshots";
import { indexPoolsReducer } from "./indexPools";
import { pairsReducer } from "./pairs";
import { settingsReducer } from "./settings";
import { stakingReducer } from "./staking";
import { tokensReducer } from "./tokens";
import { userReducer } from "./user";

export default combineReducers({
  batcher: batcherReducer,
  cache: cacheReducer,
  categories: categoriesReducer,
  dailySnapshots: dailySnapshotsReducer,
  indexPools: indexPoolsReducer,
  settings: settingsReducer,
  staking: stakingReducer,
  tokens: tokensReducer,
  user: userReducer,
  pairs: pairsReducer,
});
