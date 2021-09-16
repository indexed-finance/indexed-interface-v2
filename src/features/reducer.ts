import { batcherReducer } from "./batcher";
import { categoriesReducer } from "./categories";
import { combineReducers } from "@reduxjs/toolkit";
import { dailySnapshotsReducer } from "./dailySnapshots";
import { indexPoolsReducer } from "./indexPools";
import { masterChefReducer } from "./masterChef";
import { newStakingReducer } from "./newStaking";
import { pairsReducer } from "./pairs";
import { settingsReducer } from "./settings";
import { stakingReducer } from "./staking";
import { timelocksReducer } from "./timelocks";
import { tokensReducer } from "./tokens";
import { transactionsReducer } from "./transactions";
import { userReducer } from "./user";
import { vaultsReducer } from "./vaults";

export const rootReducer = combineReducers({
  batcher: batcherReducer,
  categories: categoriesReducer,
  dailySnapshots: dailySnapshotsReducer,
  indexPools: indexPoolsReducer,
  pairs: pairsReducer,
  settings: settingsReducer,
  staking: stakingReducer,
  newStaking: newStakingReducer,
  timelocks: timelocksReducer,
  tokens: tokensReducer,
  transactions: transactionsReducer,
  user: userReducer,
  masterChef: masterChefReducer,
  vaults: vaultsReducer,
});
