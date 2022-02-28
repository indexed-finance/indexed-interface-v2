import * as config from "config";
import { NETWORKS_BY_ID } from "config";
import { SUBGRAPH_URLS } from "@indexed-finance/subgraph-clients/dist/constants"
import axios from "axios";

export function getIndexedUrl(chainId: number) {
  const networkName = NETWORKS_BY_ID[chainId].name;
  return SUBGRAPH_URLS[networkName].indexedCore
}

export function getOldStakeURL(chainId: number) {
  if (chainId === 1) {
    return config.OLD_STAKING_SUBGRAPH_URL;
  } else {
    return config.OLD_STAKING_SUBGRAPH_URL;
  }
}

export function getUniswapUrl(chainId: number) {
  const networkName = NETWORKS_BY_ID[chainId].name;
  return SUBGRAPH_URLS[networkName].uniswap
}

export async function sendQuery(url: string, query: string) {
  const {
    data: { data },
  } = await axios.post(url, {
    query,
  });

  return data;
}
