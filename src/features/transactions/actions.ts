import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import { createAction } from "@reduxjs/toolkit";

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
      /** @param type - Type identifier for icon selection */
      type?: undefined;
    }
);

export const transactionStarted = createAction<{
  tx: TransactionResponse;
  extra?: TransactionExtra;
}>("transactions/started");

export const transactionFinalized = createAction<{
  receipt: TransactionReceipt;
  extra?: TransactionExtra;
}>("transactions/finalized");
