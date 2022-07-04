import { batcherReducer } from "./batcher";
import { categoriesReducer } from "./categories";
import { combineReducers } from "@reduxjs/toolkit";
import { dailySnapshotsReducer } from "./dailySnapshots";
import { indexPoolsReducer } from "./indexPools";
import { masterChefReducer } from "./masterChef";
import { pairsReducer } from "./pairs";
import { settingsReducer } from "./settings";
import { timelocksReducer } from "./timelocks";
import { tokensReducer } from "./tokens";
import { transactionsReducer } from "./transactions";
import { userReducer } from "./user";

export const rootReducer = combineReducers({
  batcher: batcherReducer,
  categories: categoriesReducer,
  dailySnapshots: dailySnapshotsReducer,
  indexPools: indexPoolsReducer,
  pairs: pairsReducer,
  settings: settingsReducer,
  timelocks: timelocksReducer,
  tokens: tokensReducer,
  transactions: transactionsReducer,
  user: userReducer,
  masterChef: masterChefReducer,
});
