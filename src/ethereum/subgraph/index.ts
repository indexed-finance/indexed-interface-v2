import * as config from "config";
import * as queries from "./queries";
import axios from "axios";

import type {
  Category,
  IndexPool,
  Swap,
} from "indexed-types";
import type { Swap as Trade } from "uniswap-types";

export function getUrl(chainId: number) {
  if (chainId === 1) {
    return config.INDEXED_SUBGRAPH_URL;
  } else {
    return config.INDEXED_RINKEBY_SUBGRAPH_URL;
  }
}

export async function sendQuery(query: string, url: string) {
  const {
    data: { data },
  } = await axios.post(url, {
    query,
  });
  return data;
}

export async function querySinglePool(
  url: string,
  address: string
): Promise<IndexPool> {
  const { indexPool } = await sendQuery(queries.singlePool(address), url);
  return indexPool;
}

export async function queryAllPools(url: string): Promise<IndexPool[]> {
  const { indexPools } = await sendQuery(queries.allPools, url);
  return indexPools;
}

export async function queryPoolUpdate(
  url: string,
  poolAddress: string
): Promise<IndexPool> {
  const { indexPool } = await sendQuery(queries.poolUpdate(poolAddress), url);
  return indexPool;
}

export async function queryInitial(url: string): Promise<Category[]> {
  const { categories } = await sendQuery(queries.initial, url);
  return categories;
}

export async function queryTrades(
  url: string,
  poolAddress: string
): Promise<Trade[]> {
  const { swaps } = await sendQuery(queries.trade(poolAddress), url);
  return swaps;
}

export async function querySwaps(
  url: string,
  poolAddress: string
): Promise<Swap[]> {
  const { swaps } = await sendQuery(queries.swap(poolAddress), url);
  return swaps;
}