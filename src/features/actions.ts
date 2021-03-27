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
export const coingeckoIdsLoaded = createAction<
  Array<{ id: string; symbol: string }>
>("coingeckoIdsLoaded");
/**
 *
 */
export const coingeckoDataLoaded = createAction<{
  pool: string;
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
export const receivedInitialStateFromServer = createAction<any>(
  "receivedInitialStateFromServer"
);
/**
 *
 */
export const receivedStatePatchFromServer = createAction<any>(
  "receivedStatePatchFromServer"
);

export const uniswapPairsRegistered = createAction<NormalizedPair[]>(
  "uniswapPairsRegistered"
);

export const totalSuppliesUpdated = createAction<
  { token: string; totalSupply: string }[]
>("totalSuppliesUpdated");

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

export const multicallDataReceived = createAction<MulticallData>(
  "multicallDataReceived"
);

export const cachedMulticallDataReceived = createAction<MulticallData>(
  "cachedMulticallDataReceived"
);

export const multicallDataRequested = createAction("multicallDataRequested");
