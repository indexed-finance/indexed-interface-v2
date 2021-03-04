## `PoolInitializer`

Contract that acquires the initial balances for an index pool.

This uses a short-term UniSwap price oracle to determine the ether value of tokens sent to the contract. When users contribute tokens they are credited for the moving average ether value of said tokens.

When all the tokens needed are acquired, the index pool will be initialized and this contract will receive the initial token supply (100).

Once the contract receives the index pool tokens, users can claim their share of the tokens proportional to their credited contribution value.

# Start and Finish

## `initialize` 

```
function initialize(
  address poolAddress,
  address[] tokens,
  uint256[] amounts
)
```

Sets the initializer's pool address and desired token amount.

## `finish` 

```
function finish()
```

Finishes the pool initializer and triggers pool initialization.

**Notes**

The desired amounts of all tokens must be 0.

# Token Claims

## `claimTokens` 

```
function claimTokens()
```

Claims the tokens owed to `msg.sender` based on their proportion of the total credits.

## `claimTokens` 

```
function claimTokens(address account)
```

Claims the tokens owed to `account` based on their proportion
of the total credits.

## `claimTokens` 

```
function claimTokens(address[] accounts)
```



Claims the tokens owed to `account` based on their proportion
of the total credits.

# Token Contribution

## `contributeTokens` 

```
function contributeTokens(
  address token,
  uint256 amountIn,
  uint256 minimumCredit
) returns (uint256 credit)
```

Contribute up to `amountIn` of `token` to the pool for credit.

The caller will be credited for the average weth value of the provided
tokens.

**Notes**

Caller must receive at least `minimumCredit` to not revert.
If `amountIn` is greater than the desired amount of `token`, the
desired amount will be used instead. 

## `contributeTokens` 

```
function contributeTokens(
  address[] tokens,
  uint256[] amountsIn,
  uint256 minimumCredit
) returns (uint256 credit)
```

Contribute maximum values from `amountsIn` of the corresponding
tokens in `tokens` to the pool for credit.

The caller will be credited for the average weth value of the provided
tokens.

Caller must receive at least `minimumCredit` to not revert.
If any input amount is greater than the desired amount of the corresponding
token, the desired amount will be used instead.

# Price Updates

## `updatePrices` 

```
function updatePrices()
```

Updates the prices of all desired tokens on the price oracle.

# Status Queries

## `isFinished`

```
function isFinished() returns (bool)
```

Returns whether the pool has been initialized.

# Credit Queries

## `getTotalCredit`

```
function getTotalCredit() returns (uint256)
```

Returns the total value credited for token contributions.


## `getCreditOf`

```
function getCreditOf(address account) returns (uint256)
```

Returns the amount of credit owed to `account`.

# Token Queries

## `getDesiredTokens` 

```
function getDesiredTokens() returns (address[] tokens)
```

Returns the array of desired tokens.


## `getDesiredAmount` 

```
function getDesiredAmount(address token) returns (uint256)
```

Returns the remaining amount of `token` the pool needs.


## `getCreditForTokens` 

```
function getCreditForTokens(
  address token,
  uint256 amountIn
) returns (uint144 amountOut)
```

Returns the amount of WETH the contract will credit a user for providing `amountIn` of `token`.

**Notes**

If `amountIn` is greater than the desired amount of `token`, this will calculate the output using the desired amount instead of `amountIn`.

