import { NETWORKS_BY_ID } from "../config";
import { SUBGRAPH_URLS } from "@indexed-finance/subgraph-clients/dist/constants";
import axios from "axios";

export function getIndexedUrl(chainId: number) {
  const networkName = NETWORKS_BY_ID[chainId].name;
  return SUBGRAPH_URLS[networkName].indexedCore;
}

export function getUniswapUrl(chainId: number) {
  const networkName = NETWORKS_BY_ID[chainId].name;
  return SUBGRAPH_URLS[networkName].uniswap;
}

export async function sendQuery(url: string, query: string) {
  const {
    data: { data },
  } = await axios.post(url, {
    query,
  });

  return data;
}
