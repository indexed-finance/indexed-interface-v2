import {
  PayloadAction,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { restartedDueToError } from "../actions";
import type { AppState } from "../store";

export type TransactionStatus = "pending" | "confirmed" | "reverted";

export type TransactionExtra = {
  /** @param summary - Text summary of what the transaction does */
  summary?: string;
} & (
  | {
      /** @param type - Type identifier for icon selection */
      type: "ERC20.approve";
      /** @param approval - Uses to display loading icon for pending approval */
      approval: { tokenAddress: string; spender: string; amount: string };
    }
  | {
      type: "StakingRewards.claim";
      claim: { recipient: string };
    }
  | {
      /** @param type - Type identifier for icon selection */
      type?: undefined;
    }
);

export type NormalizedTransaction = {
  /** @param hash - Transaction hash used for provider queries & EtherScan link */
  hash: string;
  /** @param from - Caller of the transaction, used to change displayed txs if user changes wallets */
  from: string;
  /** @param to - Target of the transaction, can be used to display loading icons for actions */
  to?: string;
  /** @param addedTime - Unix timestamp in ms that transaction was added */
  addedTime: number;
  /** @param gasLimit - Gas limit for transaction, used to display maximum price in ETH */
  gasLimit: number;
  /** @param gasPrice - ETH (wei) paid per unit of gas spent, used to display maximum price in ETH */
  gasPrice: number;
  /** @param confirmedTime - Unix timestamp in ms that transaction was confirmed or reverted */
  confirmedTime?: number;
  /** @param blockNumber - Block number that transaction was confirmed or reverted, can be used in display */
  blockNumber?: number;
  /** @param gasUsed - Actual gas used by transaction, used to display real price in ETH */
  gasUsed?: number;
  /** @param status - Status of transaction, used to select display icon & choose what to display */
  status: TransactionStatus;
  /** @param error - Error message of reverted transaction, can be used in display if error message is recognized */
  error?: string;
} & TransactionExtra;

const adapter = createEntityAdapter<NormalizedTransaction>({
  selectId: (entry) => entry.hash.toLowerCase(),
});

const slice = createSlice({
  name: "transactions",
  initialState: adapter.getInitialState(),
  reducers: {
    transactionStarted(
      state,
      action: PayloadAction<{
        tx: TransactionResponse;
        extra?: TransactionExtra;
      }>
    ) {
      const { tx, extra = {} } = action.payload;
      adapter.addOne(state, {
        hash: tx.hash,
        addedTime: Date.now(),
        from: tx.from,
        to: tx.to,
        gasPrice: tx.gasPrice.toNumber(),
        gasLimit: tx.gasLimit.toNumber(),
        status: "pending",
        ...extra,
      });
    },
    transactionsCleared() {
      return adapter.getInitialState();
    },
    transactionFinalized(state, action: PayloadAction<TransactionReceipt>) {
      const { transactionHash, status, gasUsed } = action.payload;
      const entry = state.entities[transactionHash.toLowerCase()];
      if (entry) {
        entry.status = status === 1 ? "confirmed" : "reverted";
        entry.gasUsed = gasUsed.toNumber();
        entry.confirmedTime = Date.now();
      }
    },
  },
  extraReducers: (builder) =>
    builder.addCase(restartedDueToError, () => adapter.getInitialState()),
});

export const { actions: transactionsActions, reducer: transactionsReducer } =
  slice;

export const transactionsSelectors = {
  ...adapter.getSelectors((state: AppState) => state.transactions),
  selectTransactionsLookup(state: AppState) {
    return state.transactions.entities;
  },
  selectTransactionIds(state: AppState) {
    return transactionsSelectors.selectIds(state);
  },
  selectTransactions(state: AppState) {
    return transactionsSelectors.selectAll(state);
  },
  selectTransaction(state: AppState, hash: string) {
    return transactionsSelectors
      .selectAll(state)
      .find((tx) => tx.hash === hash);
  },
  selectLatestTransaction(state: AppState) {
    const all = transactionsSelectors.selectAll(state);

    return all[all.length - 1];
  },
};
