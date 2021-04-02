import { NormalizedInitialData, NormalizedPair } from "ethereum";
import { createAction } from "@reduxjs/toolkit";
import type { Swap } from "indexed-types";
import type { Swap as Trade } from "uniswap-types";

/**
 *
 */
export const subgraphDataLoaded = createAction<NormalizedInitialData>(
  "subgraphDataLoaded"
);

/**
 *
 */
export const tokenStatsDataLoaded = createAction<
  Record<
    string,
    {
      price: number;
      change24Hours: number;
      percentChange24Hours: number;
      updatedAt: number;
    }
  >
>("tokenStatsDataLoaded");

/**
 *
 */
export const tokenStatsRequestFailed = createAction<{ when: number }>(
  "tokenStatsRequestFailed"
);

/**
 *
 */
export const poolTradesAndSwapsLoaded = createAction<
  Record<string, { trades: Trade[]; swaps: Swap[] }>
>("poolTradesAndSwapsLoaded");

/**
 *
 */
export const restartedDueToError = createAction("restartedDueToError");

/**
 *
 */
export const mirroredServerState = createAction<any>("mirroredServerState");

/**
 *
 */
export const uniswapPairsRegistered = createAction<NormalizedPair[]>(
  "uniswapPairsRegistered"
);
