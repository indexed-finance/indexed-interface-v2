# Summary

Index pools are tokenized portfolios that double as AMMs. The pool contract is designed to be able to radically change the composition of its portfolio without needing to access external liquidity.

The Index Pool contract is a fork of the [Balancer Pool](https://github.com/balancer-labs/balancer-core/blob/master/contracts/BPool.sol). The primary changes made to the contract were to enable more dynamic pool management so that assets can be bound, rebound and reweighed gradually and without the need to access external liquidity.

<!-- ## Terminology

- **Underlying Tokens** - The tokens held by the pool which represent its portfolio.
- **Weight** - The proportion of the pool value represented by a single token.
- **Target Weight** - The weight of a token set by the pool controller which the pool will gradually move the actual weight towards.
- **Desired Tokens** - Tokens with a target weight above zero.
- **Undesired Tokens** - Tokens with a target weight of zero.
- **Re-index** - The process of adjusting both the desired tokens and their weights.
- **Re-weigh** - The process of adjusting the target weights of the current desired tokens in a pool. -->

<!-- ## Token Weights
Every token $$t$$ in a pool has an associated weight $$W_t$$ and balance $$B_t$$. A token's normalized weight represents the total value of the pool which is held in the balance of that token, where the normalized weight is the token's denormalized weight divided by the total weight. These two values are used to price swaps between tokens - the spot price between token $$i$$ and token $$o$$ is given by the formula:

$$
SP_{i}^{o} = \frac{B_i/W_i}{B_o/W_o} \cdot \frac{1}{1-fee}
$$ -->

> It may be useful to read the Balancer [Whitepaper](https://balancer.finance/whitepaper/) or [documentation](https://docs.balancer.finance/) for additional context on the pool contract.

# Rebalancing

The typical method for rebalancing a token portfolio is to sell and purchase sufficient amounts of each asset to reach the desired weights. This typically involves trading with on-chain exchanges or using an auction system. Any method of swapping on-chain to rebalance will cause some amount of loss for the pool, potentially quite a lot. On-chain exchanges are illiquid, and auctions on Ethereum [have a history of being exploited](https://forum.makerdao.com/t/black-thursday-response-thread/1433).

Index pools rebalance themselves over time by creating small arbitrage opportunities that incentivize traders to gradually adjust token balances and weights. As tokens are swapped, their weights move slightly toward the targets set by the pool controller. This weight adjustment occurs at a maximum of once per hour in order to create small arbitrage opportunities over time that eventually bring the portfolio composition in line with the targets.

While this rebalancing process is not instantaneous, it is permissionless, it works for arbitrarily large pools, it is generally more gas efficient and it does not assume that the pool or its controller can access external liquidity to execute rebalances.

For further details on the rebalancing process, see [Rebalancing](./rebalancing/index.md).

# Limitations

**Abnormal token implementations**

Tokens that have internal transfer fees or other non-standard balance updates may create arbitrage opportunities. For now, these tokens should not be used in Indexed pools. Indexed pools do not have the same ERC20 restrictions on return values as Balancer pools, as the pool contract uses methods from OpenZeppelin's `SafeERC20` library.

**Permanent loss for some liquidity providers due to unbound token handling**

While the selling of a pool's unbound tokens is restricted to a small range around their moving average prices, it is still possible for a liquidity provider to experience permanent loss due to the way that unbound tokens are handled. If an LP exits a pool after a token is removed from the pool, but before its balance is swapped to the other underlying assets, the LP will suffer a loss of around 1% of their pool tokens' value (as 1% is the minimum weight of the pool).

**Swap input amount**

When a token is sold to a pool, the input amount can not exceed half of the pool's current balance in that token. This restriction applies to swaps and single-asset liquidity providing functions, but does not apply to all-asset liquidity providing. This only applies to an individual call to the contract, and can be bypassed with multiple calls.

**Swap output amount**

When a token is purchased from a pool, the output amount can not exceed one third of the pool's current balance in that token. This restriction applies to swaps and single-asset liquidity removal functions, but does not apply to all-asset liquidity removal. This only applies to an individual call to the contract, and can be bypassed with multiple calls.

**Minimum balance**

When a pool is first initialized, it must have a balance of at least 1e6 wei. This does not apply to tokens after the pool is initialized