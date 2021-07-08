/**
 * Used to identify which protocols the vault has deposited into.
 */
export type TokenAdapterData = {
  // adapter address
  id: string;
  // underlying token address, e.g. dai address
  underlying: string;
  // wrapper token address, not super relevant to the UI
  token: string;
  // name of the adapter in the format "[protocol] [underlying symbol] Adapter", e.g. "Compound DAI Adapter"
  // probably not relevant to UI
  name: string;
  // annual interest rate earned on deposits for this adapter as a fraction, e.g. 0.01 = 1%
  apr: number;
  // string indicating protocol, e.g. `compound`, `aave`
  protocolID: string;
};

// Nirn vaults are also ERC20 tokens
export type NirnVaultData = {
  // vault address
  id: string;
  // erc20 symbol of vault, e.g. nDAI
  symbol: string;
  // erc20 name of vault, e.g. Indexed DAI
  name: string;
  // address of underlying token, e.g. dai address
  underlying: string;
  // array of adapters currently in use
  adapters: TokenAdapterData[];
  // weights for each adapter as a fraction of 1e18, e.g. 5e17 = 50%
  // sum(weights) always = 1e18, no need to take sum to grab % weight
  weights: string[];
  // balance of `underlying` for each adapter (not particularly relevant to UI)
  balances: string[];
  // APR earned on this vault as a fraction e.g. 0.05 = 5%
  netAPR: number;
  // Fee charged on growth of the vault as a fraction, e.g. 0.1 = 10%
  performanceFee: number;
  // BN value representing amount of underlying each vault token is worth as a fraction of 1e18
  // irrespective of token decimals, e.g. (pricePerShare * balance) / 1e18 = value of balance underlying
  pricePerShare: string;
  //   d1ll0n — Today at 4:54 PM
  // just add a totalValueLocked field to the type I gave you for the vault
  totalValueLocked: string;
};
// Can use user balance with the standard erc20 balance checks to see user's balance in the vault tokens.
// NOT the same as the value of the user's balance in terms of `underlying`.
