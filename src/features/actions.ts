import { AppData } from "../services";
import { NormalizedInitialData, NormalizedPool, PoolUpdate } from "ethereum";
import { Swap } from "indexed-types";
import { Swap as Trade } from "uniswap-types";
import { createAction } from "@reduxjs/toolkit";

/**
 *
 */
export const web3DataLoaded = createAction<AppData>("web3DataLoaded");

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
export const coingeckoDataLoaded = createAction<
  Record<
    string,
    {
      price: number;
      change24Hours: number;
      percentChange24Hours: number;
      updatedAt: number;
    }
  >
>("coingeckoDataLoaded");

/**
 *
 */
export const poolUpdated = createAction<{
  pool: NormalizedPool;
  update: PoolUpdate;
}>("poolUpdated");

/**
 *
 */
export const poolTradesAndSwapsLoaded = createAction<{
  poolId: string;
  trades: Trade[];
  swaps: Swap[];
}>("poolTradesAndSwapsLoaded");
