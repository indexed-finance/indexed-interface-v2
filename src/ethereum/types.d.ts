import {
  Category,
  IndexPool,
  PoolUnderlyingToken,
  Swap,
  Token,
} from "indexed-types";
import { Swap as Trade } from "uniswap-types";

export type PoolUpdate = {
  $blockNumber: string;
  totalDenorm: string;
  totalSupply: string;
  maxTotalSupply: string;
  swapFee: string;
  tokens: {
    address: string;
    balance: string;
    usedBalance: string;
    usedDenorm: string;
    usedWeight: string;
  }[];
};

export type NormalizedEntity<T> = {
  ids: string[];
  entities: Record<string, T>;
};

export interface NormalizedToken {
  id: string;
  symbol: string;
  coingeckoId: string;
  priceData?: {
    price?: number;
    change24Hours?: number;
    percentChange24Hours?: number;
  };
  dataByCategory: Record<string, null | Token>;
  dataByIndexPool: Record<string, null | PoolUnderlyingToken>;
  dataFromPoolUpdates: Record<string, null | PoolTokenUpdate>;
}

export interface NormalizedPool
  extends Omit<IndexPool, "dailySnapshots" | "tokens"> {
  dailySnapshots: string[];
  tokens: string[];
  dataFromUpdates: null | Omit<PoolUpdate, "tokens">;
  dataForTradesAndSwaps: null | { trades: Trade[]; swaps: Swap[] };
}

export interface NormalizedCategory
  extends Omit<Category, "tokens" | "indexPools"> {
  indexPools: string[];
  tokens: string[];
}

export type NormalizedInitialData = {
  categories: NormalizedEntity<NormalizedCategory>;
  pools: NormalizedEntity<NormalizedPool>;
  dailySnapshots: NormalizedEntity<NormalizedDailySnapshot>;
  tokens: NormalizedEntity<NormalizedToken>;
};

export type PoolTokenUpdate = {
  address: string;
  balance: string;
  weight?: string;
  usedBalance: string;
  usedWeight: string;
  usedDenorm: string;
};
