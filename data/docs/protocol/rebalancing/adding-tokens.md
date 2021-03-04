# Bootstrapping new tokens

When the pool is deployed, every token in the initial asset pool must be added with sufficient tokens to cover its weight. The balance and weight for a token are used to price that token relative to the other assets in a pool, so it is important that token balances be representative of their weight.

If we simply add a new token to the pool with an arbitrary weight and no balance, it will eventually reach that weight as a result of arbitrage. However, this would obviously cause massive losses for liquidity providers who are paying exorbitant rates for the new token. Instead, we added a couple of changes to the Balancer pool contract so that tokens with no balance can be priced into swaps and joins.

## False Weight & Balance

When tokens are first added, they are assigned a minimum balance which represents the number of tokens needed to be worth 1% of the pool's portfolio. The minimum balance and minimum weight (1/100) are used to price the token relative to the other assets in the pool.

## Limitations

The exact total weight of the pool can vary slightly as the result of weight adjustments, new tokens might have external price changes before they are initialized, and the value of the pool can change as a result of liquidity provider exits and joins. Given the low value of uninitialized token as a proportion of the pool, overpricing them is less of a problem than underpricing them, as the former can not cause much loss to the pool but the latter can result in a token failing to meet its balance target. If a token's price drastically increases on external markets before the pool reaches the minimum balance for that token, the minimum balance can be updated by the pool controller.

## Restrictions

Each token in the pool is assigned a `ready` boolean field which indicates whether the token is fully initialized (meaning the pool's balance of that token is representative of its weight). When new tokens are added that the pool has no balance in, they are marked as uninitialized (`ready = false`). If a token is not ready, it can only be bought by the pool or acquired through LP joins, it can not exit the pool. Swaps that try to buy the token and LP exits that try to claim the token will revert.

## Price Premium

A slight premium is paid on new tokens based on how close they are to their minimum balances in order to incentivize faster initialization. The premium starts out at roughly 10% and decreases as a token gets closer to its minimum. The weight including the premium is calculated with:

$$W_t^u = W_{min} \cdot \left(1 + \frac{B_{t}^{min} - B_{t}}{10 \cdot B_{t}^{min}}\right)$$

## Initialization

When a token reaches its minimum balance, it is marked as ready and its weight is set. Unlike other weight changes which modify weights by 1% per hour, when a token is initialized its weight will be set to the minimum weight plus a factor proportional to the amount it exceeded the minimum balance. The reason for this is that tokens with low weights are subject to larger price fluctuations, and it is possible to swap in up to 50% of the current balance the pool holds in some token. If the token's balance is substantially higher than its weighted proportion of the pool value, it will be priced lower than it should and people will have an incentive to buy it from the pool, even though we are looking to increase the pool balance of that token.

The weight factor is: $$\frac{W_{min} \cdot \left( B_{t} - B_{t}^{min}\right)}{B_{t}^{min}}$$ so when the token is initialized, its weight is set to $$W_{min} \cdot \frac{1 + \left(B_{t} - B_{t}^{min}\right)}{B_{t}^{min}}$$ where $$B_{t}$$ is the pool's balance in that token including the amount gained in the transaction.
