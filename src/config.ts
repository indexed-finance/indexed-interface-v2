// API
export const CLIENT_STATISTICS_REPORTING_RATE = 30 * 1000;
export const CHECK_NEED_TO_RESTART_RATE = 5000;
export const NEED_TO_RESTART_THRESHOLD = 300 * 1000;
export const NEED_TO_RESTART_TIME_LIMIT = 1000 * 60 * 5; // Five minutes.
export const SERVER_DEBOUNCE_RATE = 250;
export const SERVER_POLL_RATE = 15000;
export const DEFAULT_TOKEN = "UNI";
export const DEFAULT_DECIMAL_COUNT = 18;
export const DEFAULT_TOAST_DISPLAY_TIME_IN_SECONDS = 3;
export const SPOT_PRICE_MODIFIER = 1.02;
export const SWAP_PRECISION = 10;
export const SLIPPAGE_RATE = 0.01;
export const TRADE_PRICE_INPUT_MODIFIER = 0.99;
export const TRADE_PRICE_OUTPUT_MODIFIER = 1.02;
export const GATEWAY_URL = "https://gateway.temporal.cloud/ipfs/";
export const SOCKET_PORT = 13337;
export const WEBSOCKET_SERVER_PING_RATE = 2000;
export const WEBSOCKET_SERVER_UPDATE_RATE = 10000;
export const WEBSOCKET_SERVER_PORT = 13337;
export const QUIKNODE_WEBSOCKET_PROVIDER =
  "wss://bold-old-pond.quiknode.pro/7876affe5a6bb6688c659b452fe9d81d4125d21f/";
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
export const INFURA_ID = "442bad44b92344b7b5294e4329190fea";
export const SUBGRAPH_URL_BASE = "https://api.thegraph.com";
export const SUBGRAPH_URL_INDEXED =
  typeof global === "undefined"
    ? "/subgraphs/name/indexed-finance/indexed"
    : `${SUBGRAPH_URL_BASE}/subgraphs/name/indexed-finance/indexed`;
export const SUBGRAPH_URL_UNISWAP =
  typeof global === "undefined"
    ? "/subgraphs/name/uniswap/uniswap-v2"
    : `${SUBGRAPH_URL_BASE}/subgraphs/name/uniswap/uniswap-v2`;

export const ETHEREUM_PRICE_URL = "/subgraphs/name/uniswap/uniswap-v2";
export const INDEXED_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed";
export const INDEXED_RINKEBY_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/indexed-finance/indexed-v1";
export const UNISWAP_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
export const UNISWAP_SUBGRAPH_URL_RINKEBY =
  "https://api.thegraph.com/subgraphs/name/samgos/uniswap-v2-rinkeby";

// App
export const LOCALSTORAGE_KEY = "indexed.finance | Persisted";
export const FALLBACK_CATEGORY_LOCAL_DATA = {
  description: "(MISSING LOCAL DATA)",
  symbol: "(MISSING LOCAL DATA)",
  name: "(MISSING LOCAL DATA)",
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

export const PLACEHOLDER_TOKEN_IMAGE = "https://via.placeholder.com/32";
export const NDX_ADDRESS = "0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83";
export const SOCIAL_MEDIA = [
  {
    name: "Snapshot",
    image: "snapshot",
    link: "https://gov.indexed.finance/#/",
  },
  {
    name: "Discourse",
    image: "discourse",
    link: "https://forum.indexed.finance/",
  },
  {
    name: "Twitter",
    image: "twitter",
    link: "https://twitter.com/ndxfi",
  },
  {
    name: "Discord",
    image: "discord",
    link: "https://discord.gg/jaeSTNPNt9",
  },
  {
    name: "Medium",
    image: "medium",
    link: "https://ndxfi.medium.com/",
  },
  {
    name: "GitHub",
    image: "github",
    link: "https://github.com/indexed-finance",
  },
];

// Contracts
export const UNISWAP_FACTORY_ADDRESS =
  "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f";
export const UNISWAP_ROUTER_ADDRESS =
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
export const WETH_CONTRACT_ADDRESS =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const MINT_ROUTER_ADDRESS = "0xfb6ac20d38a1f0c4f90747ca0745e140bc17e4c3";
export const BURN_ROUTER_ADDRESS = "0x348ab9b021fff6016d3eb07d3171bdef0022cfa8";

export const COMMON_BASE_TOKENS = [
  {
    id: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
  },
  {
    id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
];

export const EXTERNAL_IP = "143.198.78.205";

export const INDEX_POOL_TAGLINES: Record<string, string> = {
  // CC10
  "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3":
    "An index covering the most popular medium/large-cap Ethereum protocols, primarily drawn from decentralized finance.",
  // DEFI5
  "0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41":
    "A hyper-focused index of the most successful large-cap decentralized finance protocols across Ethereum.",
  // ORCL5
  "0xd6cb2adf47655b1babddc214d79257348cbc39a7":
    "An index representing the current market leaders in protocols designed to bring external/real-world data onto the blockchain.",
  // DEGEN
  "0x126c121f99e1e211df2e5f8de2d96fa36647c855":
    "A higher risk/reward index of promising Ethereum protocols that are judged as having significant room to grow.",
  // NFTP
  "0x68bb81b3f67f7aab5fd1390ecb0b8e1a806f2465":
    "A collectors index of governance and protocol tokens drawn from both the NFT space and the wider Metaverse.",
  // ERROR
  "0xd3deff001ef67e39212f4973b617c2e684fa436c":
    "A barbell-weighted fund tracking the favoured projects of 0xb1.484, one of the largest capital providers in DeFi.",
};