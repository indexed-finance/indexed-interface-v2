# Terminology

- **Weight** - The proportion of a pool's total value which a token represents.
- **Denormalized Weight** - The denormalized weight value. Solidity does not have good handling for fixed point numbers, so the contracts uses denormalized values to represent token weights.
- **Target Weight** - The weight that a pool's controller has determined a token should eventually have, and which swaps will move the token towards. Used interchangeably with "desired weight".
- **Initialized** - Used to describe whether a pool owns a sufficient amount of a token to cover the minimum weight<sup>[1](./pools/adding-tokens.md)</sup>.
  - **Note:** this is distinct from "pool initialization", which acts in the place of a constructor.
- **Portfolio** - The basket of assets held by a pool.
- **Portfolio Composition** - The makeup of a portfolio, particularly with regard to the weights of each token.
- **Underlying Tokens** - The tokens held by a pool.
- **Index Tokens** - Liquidity provider tokens for a pool. These represent ownership of the underlying assets in a pool.
- **Rebalance** - The process of changing the composition of an index pool.
- **Re-weigh** - The process of re-assigning the target weights of the current desired tokens in an index pool.
- **Re-index** - The process of re-assigning both the desired tokens in an index pool and their target weights.