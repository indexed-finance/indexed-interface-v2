export type ContractByChainId = Record<number, string>;

export const NATIVE_TOKEN_WRAPPER_ADDRESS: ContractByChainId = {
  1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase(),
  137: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270".toLowerCase()
}

export const UNISWAP_FACTORY_ADDRESS: ContractByChainId = {
  1: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f".toLowerCase(),
  137: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32".toLowerCase()
};

export const SUSHISWAP_FACTORY_ADDRESS: ContractByChainId = {
  1: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'.toLowerCase(),
  137: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4".toLowerCase()
};

export const UNISWAP_ROUTER_ADDRESS: ContractByChainId = {
  1: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d".toLowerCase(),
  137: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff".toLowerCase()
};

export const MULTI_TOKEN_STAKING_ADDRESS: ContractByChainId = {
  1: "0xc46e0e7ecb3efcc417f6f89b940ffaff72556382".toLowerCase()
};

export const REWARDS_SCHEDULE_ADDDRESS = {
  1: "0x131ba0fc3e4e866e5daf3d16526846fdd3e67623".toLowerCase()
};

export const MASTER_CHEF_ADDRESS: ContractByChainId = {
  1: "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd".toLowerCase()
};

export const NARWHAL_ROUTER_ADDRESS: ContractByChainId = {
  1: "0x429302C74a0350410fC8B43E4839D459dEC4D050".toLowerCase(),
  137: "0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83".toLowerCase()
};

export const ADAPTER_REGISTRY_ADDRESS: ContractByChainId = {
  1: '0x5F2945604013Ee9f80aE2eDDb384462B681859C4'.toLowerCase()
}

export const DNDX_TIMELOCK_ADDRESS: ContractByChainId = {
  1: '0xEE285F0Ef0cb1d103A64A85E5A0EDFEdcB53900f'.toLowerCase()
};

export const ETH_BALANCE_GETTER = "0xfCC222Fe0E97B39b4dbeB7b41eF5A59b0cf1193c".toLowerCase();

export const MULTICALL2_ADDRESS = "0x5e19862596Eb35BAe94D023714A029e6e824d6dd".toLowerCase();

// Tokens

export const NDX_ADDRESS: ContractByChainId = {
  1: "0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83".toLowerCase()
};

export const WETH_ADDRESS: ContractByChainId = {
  1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2".toLowerCase(),
  137: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619".toLowerCase()
};

export const SUSHI_ADDRESS: ContractByChainId = {
  1: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2".toLowerCase(),
  137: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a".toLowerCase()
};

export const DAI_ADDRESS: ContractByChainId = {
  1: "0x6b175474e89094c44da98b954eedeac495271d0f".toLowerCase(),
  137: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063".toLowerCase()
};

export const USDC_ADDRESS: ContractByChainId = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48".toLowerCase(),
  137: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174".toLowerCase()
}

export const DNDX_ADDRESS: ContractByChainId = {
  1: '0x262cd9ADCE436B6827C01291B84f1871FB8b95A3'.toLowerCase()
};