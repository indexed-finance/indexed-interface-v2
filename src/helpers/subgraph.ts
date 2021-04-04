import * as config from "config";
import axios from "axios";

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
