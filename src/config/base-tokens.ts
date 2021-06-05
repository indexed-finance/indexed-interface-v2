import { WETH_CONTRACT_ADDRESS } from "./addresses";

export const COMMON_BASE_TOKENS = [
  {
    id: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
  },
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
  {
    id: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
];

export const DISPLAYED_COMMON_BASE_TOKENS = COMMON_BASE_TOKENS.filter(t => t.id.toLowerCase() !== WETH_CONTRACT_ADDRESS.toLowerCase());