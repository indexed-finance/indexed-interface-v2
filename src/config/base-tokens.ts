import { SUSHI_ADDRESS, WETH_CONTRACT_ADDRESS } from "./addresses";

export const COMMON_BASE_TOKENS = [
  {
    id: "0x0000000000000000000000000000000000000000",
    chainId: 1,
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
  },
  {
    id: "0x6b175474e89094c44da98b954eedeac495271d0f",
    chainId: 1,
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
  },
  {
    id: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    chainId: 1,
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  {
    id: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    chainId: 1,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
  {
    id: SUSHI_ADDRESS,
    chainId: 1,
    symbol: 'SUSHI',
    name: 'SushiToken',
    decimals: 18
  }
];

const ignore = [WETH_CONTRACT_ADDRESS.toLowerCase(), SUSHI_ADDRESS.toLowerCase()]

export const DISPLAYED_COMMON_BASE_TOKENS = COMMON_BASE_TOKENS.filter(
  (t) => !ignore.includes(t.id.toLowerCase())
);