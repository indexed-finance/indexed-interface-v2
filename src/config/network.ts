import { ChainId } from "@indexed-finance/narwhal-sdk";

type EthNetwork = {
  id: number;
  name: 'mainnet' | 'polygon';
  icon: string;
  explorer: BlockExplorer;
  defaultExchange: DefaultExchange;
  addChainParameter: AddEthereumChainParameter;
}

type BlockExplorer = {
  name: string;
  url: string;
  icon: string;
}

type DefaultExchange = {
  name: string;
  addLiquidityUrl: string;
  swapUrl: string;
  infoUrl: string;
  icon: string;
}

export const CHEAP_GAS_CHAINS: number[] = [ChainId.POLYGON]

interface AddEthereumChainParameter {
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
}

export const NETWORKS: Record<string, EthNetwork> = {
  mainnet: {
    id: 1,
    name: 'mainnet',
    icon: "eth.svg",
    explorer: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      icon: 'etherscan.png'
    },
    defaultExchange: {
      name: 'Uniswap',
      icon: 'uniswap-link.png',
      swapUrl: 'https://app.uniswap.org/#/swap?use=V2&',
      addLiquidityUrl: 'https://app.uniswap.org/#/add/v2/',
      infoUrl: 'https://v2.info.uniswap.org'
    },
    addChainParameter: {
      chainId: "0x1",
      chainName: "Ethereum Mainnet",
      blockExplorerUrls: ["https://etherscan.io/"],
      rpcUrls: [],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      }
    }
  },
  polygon: {
    id: 137,
    name: 'polygon',
    icon: "matic.png",
    explorer: {
      name: 'Polygonscan',
      url: 'https://polygonscan.com',
      icon: 'matic.png'
    },
    defaultExchange: {
      name: 'Quickswap',
      icon: 'quickswap.png',
      addLiquidityUrl: 'https://quickswap.exchange/#/add/',
      swapUrl: 'https://quickswap.exchange/#/swap?',
      infoUrl: 'https://info.quickswap.exchange/#'
    },
    addChainParameter: {
      chainId: "0x89",
      chainName: "Polygon Mainnet",
      iconUrls: ["https://polygonscan.com/images/svg/brands/polygon.svg"],
      blockExplorerUrls: ["https://polygonscan.com/"],
      rpcUrls: [
        "https://polygon-rpc.com/",
        "https://matic-mainnet.chainstacklabs.com",
        "https://rpc-mainnet.maticvigil.com"
      ],
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
      }
    }
  }
};

export const NETWORKS_BY_ID: Record<number, EthNetwork> = {
  1: NETWORKS.mainnet,
  137: NETWORKS.polygon
}

export const SUPPORTED_NETWORKS = [
  ChainId.MAINNET,
  ChainId.POLYGON
];
export const SUPPORTED_NETWORK_NAMES = SUPPORTED_NETWORKS.map(chainId => NETWORKS_BY_ID[chainId].name);

export const NETWORK_EXPLORER = {
  1: `https://etherscan.io`,
  137: `https://polygonscan.com`
}