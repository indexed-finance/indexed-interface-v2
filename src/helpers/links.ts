import { ChainId } from "@indexed-finance/narwhal-sdk";

const EXPLORER: Record<number, string> = {
  [ChainId.MAINNET]: 'https://etherscan.io',
  [ChainId.POLYGON]: 'https://polygonscan.com'
};

const UNISWAP_INFO: Record<number, string> = {
  [ChainId.MAINNET]: 'https://v2.info.uniswap.org',
  [ChainId.POLYGON]: 'https://info.quickswap.exchange/#'
};

const SUSHISWAP_INFO: Record<number, string> = {
  [ChainId.MAINNET]: 'https://analytics.sushi.com',
  [ChainId.POLYGON]: 'https://analytics-polygon.sushi.com'
}

export const etherscanAddressLink = (address: string, network = 1) => `${EXPLORER[network]}/address/${address}`;
export const etherscanTokenLink = (address: string, network = 1) => `${EXPLORER[network]}/token/${address}`;
export const etherscanTransactionLink = (tx: string, network = 1) => `${EXPLORER[network]}/tx/${tx}`;

export const uniswapInfoTokenLink = (address: string, network = 1) => `${UNISWAP_INFO[network]}/token/${address}`;
export const uniswapInfoPairLink = (address: string, network = 1) => `${UNISWAP_INFO[network]}/pair/${address}`;

export const sushiswapInfoTokenLink = (address: string, network = 1) => `${SUSHISWAP_INFO[network]}.sushi.com/tokens/${address}`;
export const sushiswapInfoPairLink = (address: string, network = 1) => `${SUSHISWAP_INFO[network]}.sushi.com/pairs/${address}`;

export const sushiswapAddLiquidityLink = (token0: string, token1: string, network = 1) => `https://app.sushi.com/add/${token0}/${token1}`