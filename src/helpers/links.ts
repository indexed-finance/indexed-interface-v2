import { ChainId } from "@indexed-finance/narwhal-sdk";
import { NETWORKS_BY_ID } from "config";

const SUSHISWAP_INFO_URL: Record<number, string> = {
  [ChainId.MAINNET]: 'https://analytics.sushi.com',
  [ChainId.POLYGON]: 'https://analytics-polygon.sushi.com'
}

export const explorerAddressLink = (address: string, chainId = 1) => `${NETWORKS_BY_ID[chainId].explorer.url}/address/${address}`;
export const explorerTokenLink = (address: string, chainId = 1) => `${NETWORKS_BY_ID[chainId].explorer.url}/token/${address}`;
export const explorerTransactionLink = (tx: string, chainId = 1) => `${NETWORKS_BY_ID[chainId].explorer.url}/tx/${tx}`;

export const uniswapInfoTokenLink = (address: string, chainId = 1) => `${NETWORKS_BY_ID[chainId].defaultExchange.infoUrl}/token/${address}`;
export const uniswapInfoPairLink = (address: string, chainId = 1) => `${NETWORKS_BY_ID[chainId].defaultExchange.infoUrl}/pair/${address}`;

export const exchangeAddLiquidityLink = (token1: string, token2 = "ETH", chainId: number) =>
  `${NETWORKS_BY_ID[chainId].defaultExchange.addLiquidityUrl}${token1}/${token2}`;

export const exchangeSwapLink = (buyToken: string, sellToken = "ETH", chainId: number) =>
  `${NETWORKS_BY_ID[chainId].defaultExchange.swapUrl}inputCurrency=${sellToken}&outputCurrency=${buyToken}`

export const sushiswapInfoTokenLink = (address: string, chainId = 1) => `${SUSHISWAP_INFO_URL[chainId]}.sushi.com/tokens/${address}`;
export const sushiswapInfoPairLink = (address: string, chainId = 1) => `${SUSHISWAP_INFO_URL[chainId]}.sushi.com/pairs/${address}`;

export const sushiswapAddLiquidityLink = (token0: string, token1: string, chainId = 1) => `https://app.sushi.com/add/${token0}/${token1}`