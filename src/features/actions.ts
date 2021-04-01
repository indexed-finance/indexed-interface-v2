import { NormalizedInitialData, NormalizedPair } from "ethereum";
import { Swap } from "indexed-types";
import { Swap as Trade } from "uniswap-types";
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
export const coingeckoDataLoaded = createAction<{
  pool: null | string;
  tokens: Record<
    string,
    {
      price: number;
      change24Hours: number;
      percentChange24Hours: number;
      updatedAt: number;
    }
  >;
}>("coingeckoDataLoaded");

/**
 *
 */
export const poolTradesAndSwapsLoaded = createAction<{
  poolId: string;
  trades: Trade[];
  swaps: Swap[];
}>("poolTradesAndSwapsLoaded");

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

// #region Multicall
export type MulticallData = {
  blockNumber: number;
  callers: Record<
    string,
    {
      onChainCalls: string[];
      offChainCalls: string[];
    }
  >;
  callsToResults: Record<string, string[]>;
};

export const multicallDataRequested = createAction("multicallDataRequested");

export const multicallDataReceived = createAction<MulticallData>(
  "multicallDataReceived"
);

export const cachedMulticallDataReceived = createAction<MulticallData>(
  "cachedMulticallDataReceived"
);
// #endregion
