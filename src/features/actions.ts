import { NormalizedInitialData, NormalizedPair } from "ethereum";
import { createAction } from "@reduxjs/toolkit";

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
