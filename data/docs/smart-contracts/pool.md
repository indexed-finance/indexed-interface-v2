# `IndexPool`

# Controls

## `configure` 

```
function configure(address controller, string name, string symbol)
```



Sets the controller address and the token name & symbol.
Note: This saves on storage costs for multi-step pool deployment.


## `initialize` 

```
function initialize(address[] tokens, uint256[] balances, uint96[] denorms, address tokenProvider, address unbindHandler)
```



Sets up the initial assets for the pool.
Note: `tokenProvider` must have approved the pool to transfer the
corresponding `balances` of `tokens`.


## `setMaxPoolTokens` 

```
function setMaxPoolTokens(uint256 maxPoolTokens)
```



Sets the maximum number of pool tokens that can be minted.
This value will be used in the alpha to limit the maximum damage
that can be caused by a catastrophic error. It can be gradually
increased as the pool continues to not be exploited.
If it is set to 0, the limit will be removed.

## `setSwapFee` 

```
function setSwapFee(uint256 swapFee)
```



Set the swap fee.
Note: Swap fee must be between 0.0001% and 10%


## `reweighTokens` 

```
function reweighTokens(address[] tokens, uint96[] desiredDenorms)
```


Sets the desired weights for the pool tokens, which
will be adjusted over time as they are swapped.
Note: This does not check for duplicate tokens or that the total
of the desired weights is equal to the target total weight (25).
Those assumptions should be met in the controller. Further, the
provided tokens should only include the tokens which are not set
for removal.

## `reindexTokens` 

```
function reindexTokens(address[] tokens, uint96[] desiredDenorms, uint256[] minimumBalances)
```


Update the underlying assets held by the pool and their associated
weights. Tokens which are not currently bound will be gradually added
as they are swapped in to reach the provided minimum balances, which must
be an amount of tokens worth the minimum weight of the total pool value.
If a currently bound token is not received in this call, the token's
desired weight will be set to 0.

## `setMinimumBalance` 

```
function setMinimumBalance(address token, uint256 minimumBalance)
```



Updates the minimum balance for an uninitialized token.
This becomes useful if a token's external price significantly
rises after being bound, since the pool can not send a token
out until it reaches the minimum balance.

# Liquidity Provider Actions

## `joinPool` 

```
function joinPool(uint256 poolAmountOut, uint256[] maxAmountsIn)
```



Mint new pool tokens by providing the proportional amount of each
underlying token's balance relative to the proportion of pool tokens minted.
For any underlying tokens which are not initialized, the caller must provide
the proportional share of the minimum balance for the token rather than the
actual balance.


## `joinswapExternAmountIn` 

```
function joinswapExternAmountIn(address tokenIn, uint256 tokenAmountIn, uint256 minPoolAmountOut) returns (uint256)
```



Pay `tokenAmountIn` of `tokenIn` to mint at least `minPoolAmountOut`
pool tokens.
The pool implicitly swaps `(1- weightTokenIn) * tokenAmountIn` to the other
underlying tokens. Thus a swap fee is charged against the input tokens.


## `joinswapPoolAmountOut` 

```
function joinswapPoolAmountOut(address tokenIn, uint256 poolAmountOut, uint256 maxAmountIn) returns (uint256)
```



Pay up to `maxAmountIn` of `tokenIn` to mint exactly `poolAmountOut`.
The pool implicitly swaps `(1- weightTokenIn) * tokenAmountIn` to the other
underlying tokens. Thus a swap fee is charged against the input tokens.


## `exitPool` 

```
function exitPool(uint256 poolAmountIn, uint256[] minAmountsOut)
```



Burns `poolAmountIn` pool tokens in exchange for the amounts of each
underlying token's balance proportional to the ratio of tokens burned to
total pool supply. The amount of each token transferred to the caller must
be greater than or equal to the associated minimum output amount from the
`minAmountsOut` array.

# Swaps & Flash Loans

## `exitswapPoolAmountIn` 

```
function exitswapPoolAmountIn(address tokenOut, uint256 poolAmountIn, uint256 minAmountOut) returns (uint256)
```



Burns `poolAmountIn` pool tokens in exchange for at least `minAmountOut`
of `tokenOut`. Returns the number of tokens sent to the caller.
The pool implicitly burns the tokens for all underlying tokens and swaps them
to the desired output token. A swap fee is charged against the output tokens.


## `exitswapExternAmountOut` 

```
function exitswapExternAmountOut(address tokenOut, uint256 tokenAmountOut, uint256 maxPoolAmountIn) returns (uint256)
```



Burn up to `maxPoolAmountIn` for exactly `tokenAmountOut` of `tokenOut`.
Returns the number of pool tokens burned.
The pool implicitly burns the tokens for all underlying tokens and swaps them
to the desired output token. A swap fee is charged against the output tokens.


## `gulp` 

```
function gulp(address token)
```



Absorb any tokens that have been sent to the pool.
If the token is not bound, it will be sent to the unbound
token handler.

## `flashBorrow` 

```
function flashBorrow(address recipient, address token, uint256 amount, bytes data)
```



Execute a flash loan, transferring `amount` of `token` to `recipient`.
`amount` must be repaid with `swapFee` interest by the end of the transaction.


## `swapExactAmountIn` 

```
function swapExactAmountIn(address tokenIn, uint256 tokenAmountIn, address tokenOut, uint256 minAmountOut, uint256 maxPrice) returns (uint256, uint256)
```



Execute a token swap with a specified amount of input
tokens and a minimum amount of output tokens.
Note: Will revert if `tokenOut` is uninitialized.


## `swapExactAmountOut` 

```
function swapExactAmountOut(address tokenIn, uint256 maxAmountIn, address tokenOut, uint256 tokenAmountOut, uint256 maxPrice) returns (uint256, uint256)
```



Trades at most `maxAmountIn` of `tokenIn` for exactly `tokenAmountOut`
of `tokenOut`.
Returns the actual input amount and the new spot price after the swap,
which can not exceed `maxPrice`.

# Queries

## `isPublicSwap` 

```
function isPublicSwap() returns (bool)
```


Check if swapping tokens and joining the pool is allowed.

## `getSwapFee` 

```
function getSwapFee() returns (uint256)
```


## `getController` 

```
function getController() returns (address)
```


Returns the controller address.

## `getMaxPoolTokens` 

```
function getMaxPoolTokens() returns (uint256)
```

Returns the maximum supply. If zero, there is no maximum.

## `isBound` 

```
function isBound(address t) returns (bool)
```


Check if a token is bound to the pool.

## `getNumTokens` 

```
function getNumTokens() returns (uint256)
```


Get the number of tokens bound to the pool.

## `getCurrentTokens` 

```
function getCurrentTokens() returns (address[] tokens)
```


Get all bound tokens.

## `getCurrentDesiredTokens` 

```
function getCurrentDesiredTokens() returns (address[] tokens)
```


Returns the list of tokens which have a desired weight above 0.
Tokens with a desired weight of 0 are set to be phased out of the pool.

## `getDenormalizedWeight` 

```
function getDenormalizedWeight(address token) returns (uint256)
```


Returns the denormalized weight of a bound token.

## `getTokenRecord` 

```
function getTokenRecord(address token) returns (struct IIndexPool.Record record)
```


Returns the record for a token bound to the pool.

## `extrapolatePoolValueFromToken` 

```
function extrapolatePoolValueFromToken() returns (address, uint256)
```


Finds the first token which is both initialized and has a
desired weight above 0, then returns the address of that token
and the extrapolated value of the pool in terms of that token.
The value is extrapolated by multiplying the token's
balance by the reciprocal of its normalized weight.


## `getTotalDenormalizedWeight` 

```
function getTotalDenormalizedWeight() returns (uint256)
```


Get the total denormalized weight of the pool.

## `getBalance` 

```
function getBalance(address token) returns (uint256)
```


Returns the stored balance of a bound token.

## `getMinimumBalance` 

```
function getMinimumBalance(address token) returns (uint256)
```



Get the minimum balance of an uninitialized token.
Note: Throws if the token is initialized.

## `getUsedBalance` 

```
function getUsedBalance(address token) returns (uint256)
```



Returns the balance of a token which is used in price
calculations. If the token is initialized, this is the
stored balance; if not, this is the minimum balance.

## `getSpotPrice` 

```
function getSpotPrice(address tokenIn, address tokenOut) returns (uint256)
```



Returns the spot price for `tokenOut` in terms of `tokenIn`.

# Internal Functions

## `_pullPoolShare` 

```
function _pullPoolShare(address from, uint256 amount)
```





## `_pushPoolShare` 

```
function _pushPoolShare(address to, uint256 amount)
```





## `_mintPoolShare` 

```
function _mintPoolShare(uint256 amount)
```





## `_burnPoolShare` 

```
function _burnPoolShare(uint256 amount)
```





## `_pullUnderlying` 

```
function _pullUnderlying(address erc20, address from, uint256 amount)
```





## `_pushUnderlying` 

```
function _pushUnderlying(address erc20, address to, uint256 amount)
```





## `_bind` 

```
function _bind(address token, uint256 minimumBalance, uint96 desiredDenorm)
```



Bind a token by address without actually depositing a balance.
The token will be unable to be swapped out until it reaches the minimum balance.
Note: Token must not already be bound.
Note: `minimumBalance` should represent an amount of the token which is worth
the portion of the current pool value represented by the minimum weight.


## `_unbind` 

```
function _unbind(address token)
```



Remove a token from the pool.
Replaces the address in the tokens array with the last address,
then removes it from the array.
Note: This should only be called after the total weight has been adjusted.
Note: Must be called in a function with:
- _lock_ modifier to prevent reentrance
- requirement that the token is bound

## `_setDesiredDenorm` 

```
function _setDesiredDenorm(address token, uint96 desiredDenorm)
```


## `_increaseDenorm` 

```
function _increaseDenorm(struct IIndexPool.Record record, address token)
```


## `_decreaseDenorm` 

```
function _decreaseDenorm(struct IIndexPool.Record record, address token)
```


## `_updateInputToken` 

```
function _updateInputToken(address token, struct IIndexPool.Record record, uint256 realBalance)
```



Handles weight changes and initialization of an
input token.
If the token is not initialized and the new balance is
still below the minimum, this will not do anything.
If the token is not initialized but the new balance will
bring the token above the minimum balance, this will
mark the token as initialized, remove the minimum
balance and set the weight to the minimum weight plus
1%.


## `_getInputToken` 

```
function _getInputToken(address token) returns (struct IIndexPool.Record record, uint256 realBalance)
```



Get the record for a token which is being swapped in.
The token must be bound to the pool. If the token is not
initialized (meaning it does not have the minimum balance)
this function will return the actual balance of the token
which the pool holds, but set the record's balance and weight
to the token's minimum balance and the pool's minimum weight.
This allows the token swap to be priced correctly even if the
pool does not own any of the tokens.

## `_getOutputToken` 

```
function _getOutputToken(address token) returns (struct IIndexPool.Record record)
```





