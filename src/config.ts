import Fortmatic from "fortmatic";
import Torus from "@toruslabs/torus-embed";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const DEFAULT_TOKEN = "UNI";
export const DEFAULT_DECIMAL_COUNT = 18;
export const DEFAULT_TOAST_DISPLAY_TIME_IN_SECONDS = 3;
export const SPOT_PRICE_MODIFIER = 1.02;
export const SWAP_PRECISION = 10;
export const TRADE_PRICE_INPUT_MODIFIER = 0.99;
export const TRADE_PRICE_OUTPUT_MODIFIER = 1.02;
export const GATEWAY_URL = "https://gateway.temporal.cloud/ipfs/";
export const LOCALSTORAGE_KEY = "indexed.finance | Persisted";
export const WETH_CONTRACT_ADDRESS =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const SOCKET_PORT = 13337;
export const PROVIDER_OPTIONS = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "442bad44b92344b7b5294e4329190fea",
    },
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: "pk_test_F0261A757AD16AD0",
    },
  },
  torus: {
    package: Torus,
    options: {
      networkParams: {
        chainId: 1,
        networkId: 1,
      },
    },
  },
};

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

export const ERRORS = {
  Web3Service: {
    badNetwork: "Web3Service: Bad network.",
    fetchAccountsPriorToConnect:
      "Web3Service: Cannot fetch accounts prior to connecting. Call #connect first.",
    fetchPoolsPriorToConnect:
      "Web3Service: Cannot fetch pools prior to connecting. Call #connect first.",
    fetchTokensPriorToConnect:
      "Web3Service: Cannot fetch tokens prior to connecting. Call #connect first.",
    fetchTokensPriorToPools:
      "Web3Service: Cannot fetch tokens prior to pools. Call #fetchPools first.",
    poolMissingMetadata: "Web3Service: Active pool is missing metadata.",
    fetchCategoriesBeforeHelpers:
      "Web3Service: Cannot fetch categories prior to helpers. Call #fetchHelpers first.",
    fetchMetadataBeforeHelpers:
      "Web3Service: Cannot fetch pool metadata prior to helpers. Call #fetchHelpers first.",
    noRelevantHelper:
      "Web3Service: There is no pool helper that matches an index pool.",
  },
  UniswapService: {
    tokenDoesntExist: "UniswapService: The requested token does not exist.",
    pairedTokenDoesntExist: "UniswapService: A paired token does not exist.",
  },
};

export const SUBGRAPH_URL_INDEXED =
  "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed";
export const SUBGRAPH_URL_UNISWAP =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

// export const SUBGRAPH_URL_INDEXED =
//   process.env.REACT_APP_ETH_NETWORK === NETWORKS.mainnet.name
//     ? "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed"
//     : "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed-v1";

// export const SUBGRAPH_URL_UNISWAP =
//   process.env.REACT_APP_ETH_NETWORK === NETWORKS.mainnet.name
//     ? "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
//     : "https://api.thegraph.com/subgraphs/name/samgos/uniswap-v2-rinkeby";

export const ETHEREUM_PRICE_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";

export const SOCIAL_MEDIA = [
  {
    name: "Snapshot",
    image: "snapshot.png",
    link: "https://gov.indexed.finance/#/",
  },
  {
    name: "Discourse",
    image: "discourse.png",
    link: "https://forum.indexed.finance/",
  },
  {
    name: "Twitter",
    image: "twitter.png",
    link: "https://twitter.com/ndxfi",
  },
  {
    name: "Discord",
    image: "discord.png",
    link: "https://discord.gg/jaeSTNPNt9",
  },
  {
    name: "Medium",
    image: "medium.png",
    link: "https://ndxfi.medium.com/",
  },
  {
    name: "GitHub",
    image: "github.png",
    link: "https://github.com/indexed-finance",
  },
];

export const INDEXED_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed";
export const INDEXED_RINKEBY_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed-v1";
export const UNISWAP_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
export const UNISWAP_SUBGRAPH_URL_RINKEBY =
  "https://api.thegraph.com/subgraphs/name/samgos/uniswap-v2-rinkeby";
