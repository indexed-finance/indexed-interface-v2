import {
  ContractByChainId,
  DAI_ADDRESS,
  NATIVE_TOKEN_WRAPPER_ADDRESS,
  SUSHI_ADDRESS,
  USDC_ADDRESS,
  WETH_ADDRESS
} from "./addresses";
import { SUPPORTED_NETWORKS } from "./network";

export const BRIDGED_POLYGON_ADDRESSES: Record<string, string> = {
  // CC10
  "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3": "0x9c49ba0212bb5db371e66b59d1565b7c06e4894e",
  // DEFI5
  "0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41": "0x42435f467d33e5c4146a4e8893976ef12bbce762",
  // DEGEN
  "0x126c121f99e1e211df2e5f8de2d96fa36647c855": "0x8a2870fb69a90000d6439b7adfb01d4ba383a415",
  // FFF
  "0xabafa52d3d5a2c18a4c1ae24480d22b831fc0413": "0x9aceb6f749396d1930abc9e263efc449e5e82c13",
};

type BaseToken = {
  id: string;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
}

export const NATIVE_TOKEN: Record<number, { name: string; symbol: string; }> = {
  1: { name: "Ether", symbol: "ETH" },
  137: { name: "Matic", symbol: "MATIC" }
}

export const NATIVE_TOKEN_WRAPPER: Record<number, BaseToken> = SUPPORTED_NETWORKS.reduce(
  (prev, chainId) => ({
    ...prev,
    [chainId]: {
      id: NATIVE_TOKEN_WRAPPER_ADDRESS[chainId],
      chainId,
      name: `Wrapped ${NATIVE_TOKEN[chainId].name}`,
      symbol: `W${NATIVE_TOKEN[chainId].symbol}`,
      decimals: 18
    }
  }),
  {}
)

const tokenInfo: [ContractByChainId, string, string, number][] = [
  [SUSHI_ADDRESS, "Sushi", "SUSHI", 18],
  [WETH_ADDRESS, "Wrapped Ether", "WETH", 18],
  [USDC_ADDRESS, "USD Coin", "USDC", 6],
  [DAI_ADDRESS, "Dai Stablecoin", "DAI", 18]
]

const networkTokens = (chainId: number): BaseToken[] => {
  const {name, symbol} = NATIVE_TOKEN[chainId];
  const nativeToken = {
    id: "0x0000000000000000000000000000000000000000",
    chainId,
    name,
    symbol,
    decimals: 18
  };
  const nativeTokenWrapper = {
    id: NATIVE_TOKEN_WRAPPER_ADDRESS[chainId],
    chainId,
    name: `Wrapped ${nativeToken.name}`,
    symbol: `W${nativeToken.symbol}`,
    decimals: 18
  }
  const nonNativeTokens = tokenInfo.map(([ addressByChain, name, symbol, decimals ]) => ({
    id: addressByChain[chainId],
    chainId,
    name,
    symbol,
    decimals
  })).filter((token) => token.id);
  const tokens = [
    nativeToken,
    ...nonNativeTokens
  ]
  if (!tokens.find(t => t.id === nativeTokenWrapper.id)) {
    tokens.push(nativeTokenWrapper);
  }
  return tokens;
}

export const COMMON_BASE_TOKENS: Record<number, BaseToken[]> = {
  1: networkTokens(1),
  137: networkTokens(137)
};

const ignore = [/* WETH_ADDRESS,  */SUSHI_ADDRESS]

export const DISPLAYED_COMMON_BASE_TOKENS: Record<number, BaseToken[]> = {
  1: COMMON_BASE_TOKENS[1].filter(t => !ignore.map(tI => tI[1]).includes(t.id)),
  137: COMMON_BASE_TOKENS[137].filter(t => !ignore.map(tI => tI[137]).includes(t.id)),
}