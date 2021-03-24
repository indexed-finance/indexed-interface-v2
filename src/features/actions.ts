import {
  NormalizedInitialData,
  NormalizedPair,
  NormalizedPool,
  PairReservesUpdate,
  PoolUpdate,
  StakingPoolUpdate,
} from "ethereum";
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
/**
 *
 */
export const poolUserDataLoaded = createAction<{
  blockNumber: number;
  poolId: string;
  userData: Record<string, { allowance: string; balance: string }>;
}>("poolUserDataLoaded");
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

export const uniswapPairsUpdated = createAction<PairReservesUpdate[]>(
  "uniswapPairsUpdated"
);

export const uniswapPairsRegistered = createAction<NormalizedPair[]>(
  "uniswapPairsRegistered"
);

export const totalSuppliesUpdated = createAction<
  { token: string; totalSupply: string }[]
>("totalSuppliesUpdated");

export const stakingPoolUpdated = createAction<StakingPoolUpdate>(
  "stakingPoolUpdated"
);

export type MulticallData = {
  blockNumber: number;
  resultsByRegistrant: Record<
    string,
    Array<{
      call: string;
      result: string[];
    }>
  >;
};

export const multicallDataReceived = createAction<{
  data: MulticallData;
  isLegitimate: boolean;
}>("multicallDataReceived");

export const multicallDataRequested = createAction("multicallDataRequested");
