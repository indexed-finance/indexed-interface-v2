import * as config from "config";
import axios from "axios";

export function getIndexedUrl(chainId: number) {
  if (chainId === 1) {
    return config.INDEXED_SUBGRAPH_URL;
  } else {
    return config.INDEXED_RINKEBY_SUBGRAPH_URL;
  }
}

export function getOldStakeURL(chainId: number) {
  if (chainId === 1) {
    return config.OLD_STAKING_SUBGRAPH_URL;
  } else {
    return config.INDEXED_RINKEBY_SUBGRAPH_URL;
  }
}

export function getUniswapUrl(chainId: number) {
  if (chainId === 1) {
    return config.UNISWAP_SUBGRAPH_URL;
  } else {
    return config.UNISWAP_SUBGRAPH_URL_RINKEBY;
  }
}

export async function sendQuery(url: string, query: string) {
  const {
    data: { data },
  } = await axios.post(url, {
    query,
  });

  return data;
}
