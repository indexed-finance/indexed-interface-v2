# `UnboundTokenSeller`

Contract for swapping undesired tokens to desired tokens for an index pool.

This contract is deployed as a proxy for each index pool. When tokens are unbound from a pool, they are transferred to this contract and sold on UniSwap or to anyone who calls the contract in exchange for any token which is currently bound to its index pool and which has a desired weight about zero.

It uses a short-term uniswap price oracle to price swaps and has a configurable slippage rate which determines the range around the moving average for which it will accept a trade.


## `constructor` 

```
function constructor(contract IUniswapV2Router02 uniswapRouter, contract UniSwapV2PriceOracle oracle, address controller)
```

# Controls

## `initialize` 

```
function initialize(contract IPool pool, uint8 premiumPercent)
```



Initialize the proxy contract with the acceptable premium rate and the address of the pool it is for.

## `setPremiumRate` 

```
function setPremiumRate(uint8 premiumPercent)
```



Set the premium rate as a percent.

## `emergencyExecuteSwapTokensForExactTokens` 

```
function emergencyExecuteSwapTokensForExactTokens(address tokenIn, address tokenOut, uint256 maxAmountIn, uint256 amountOut, address[] path)
```



Emergency function that allows the controller to force a token
sale through UniSwap. This exists in case of an emergency which
demands immediate removal of a token.

# Pool Interaction

## `handleUnbindToken` 

```
function handleUnbindToken(address token, uint256 amount)
```

Receive `amount` of `token` from the pool.

# UniSwap Trades

## `executeSwapTokensForExactTokens` 

```
function executeSwapTokensForExactTokens(address tokenIn, address tokenOut, uint256 maxAmountIn, uint256 amountOut, address[] path) returns (uint256 premiumPaidToCaller)
```



Execute a trade with UniSwap to sell some tokens held by the contract
for some tokens desired by the pool and pays the caller any tokens received
above the minimum acceptable output.


## `executeSwapExactTokensForTokens` 

```
function executeSwapExactTokensForTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address[] path) returns (uint256 premiumPaidToCaller)
```



Executes a trade with UniSwap to sell some tokens held by the contract
for some tokens desired by the pool and pays the caller any tokens received
above the minimum acceptable output.

# Caller Trades

## `swapExactTokensForTokens` 

```
function swapExactTokensForTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) returns (uint256 amountOut)
```



Swap exactly `amountIn` of `tokenIn` for at least `minAmountOut`
of `tokenOut`.


## `swapTokensForExactTokens` 

```
function swapTokensForExactTokens(address tokenIn, address tokenOut, uint256 maxAmountIn, uint256 amountOut) returns (uint256 amountIn)
```



Swap up to `maxAmountIn` of `tokenIn` for exactly `amountOut`
of `tokenOut`.

# Price Queries

## `calcInGivenOut` 

```
function calcInGivenOut(
  address tokenIn,
  address tokenOut,
  uint256 amountOut
) returns (uint256 amountIn)
```

Calculate the amount of `tokenIn` the pool will accept for
`amountOut` of `tokenOut`.

## `calcOutGivenIn` 

```
function calcOutGivenIn(
  address tokenIn,
  address tokenOut,
  uint256 amountIn
) returns (uint256 amountOut)
```


Calculate the amount of `tokenOut` the pool will give for
`amountIn` of `tokenIn`.