import { ChainId } from "@indexed-finance/narwhal-sdk";

export const NETWORKS = {
  mainnet: {
    id: 1,
    name: "mainnet",
  },
  rinkeby: {
    id: 4,
    name: "rinkeby",
  },
};

export const SUPPORTED_NETWORKS = [
  ChainId.MAINNET,
  ChainId.POLYGON
]