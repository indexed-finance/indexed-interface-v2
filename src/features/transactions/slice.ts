import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { restartedDueToError } from "../actions";
import type { AppState } from "../store";

export interface NormalizedTransaction {
  hash: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  claim?: { recipient: string };
  receipt?: {
    to: string;
    from: string;
    contractAddress: string;
    transactionIndex: number;
    blockHash: string;
    transactionHash: string;
    blockNumber: number;
    status?: number;
  };
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
}

const adapter = createEntityAdapter<NormalizedTransaction>({
  selectId: (entry) => entry.hash.toLowerCase(),
});

const slice = createSlice({
  name: "transactions",
  initialState: adapter.getInitialState(),
  reducers: {
    transactionStarted(state, action: PayloadAction<NormalizedTransaction>) {
      adapter.addOne(state, action.payload);
    },
    transactionsCleared() {
      return adapter.getInitialState();
    },
    transactionChecked(
      state,
      action: PayloadAction<NormalizedTransaction & { blockNumber: number }>
    ) {
      const { blockNumber, hash, lastCheckedBlockNumber } = action.payload;
      const entry = state.entities[hash.toLowerCase()];

      if (entry) {
        entry.lastCheckedBlockNumber = Math.max(
          blockNumber,
          lastCheckedBlockNumber ?? 0
        );
      }
    },
    transactionFinalized(state, action: PayloadAction<NormalizedTransaction>) {
      const entry = state.entities[action.payload.hash.toLowerCase()];

      if (entry) {
        entry.receipt = action.payload.receipt;
        entry.confirmedTime = new Date().getTime();
      }
    },
  },
  extraReducers: (builder) =>
    builder.addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const {
  actions: transactionsActions,
  reducer: transactionsReducer,
} = slice;

export const transactionsSelectors = {
  selectTransactions(state: AppState) {
    return state.transactions;
  },
};
