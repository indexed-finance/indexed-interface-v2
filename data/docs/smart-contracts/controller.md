# `MarketCapSqrtController`

This contract implements the market cap square root index management strategy.

Categories are periodically sorted, ranking their tokens in descending order by market cap.

Index pools have a defined size which is used to select the top tokens from the pool's category. Every 2 weeks, pools are either re-weighed or re-indexed. They are re-indexed once for every three re-weighs.

Re-indexing involves selecting the top tokens from the pool's category and weighing them by the square root of their market caps. Re-weighing involves weighing the tokens which are already indexed by the pool by the square root of their market caps. When a pool is re-weighed, only the tokens with a desired weight above 0 are included.

## `constructor` 

```
constructor(
  UniSwapV2PriceOracle oracle,
  address ndx,
  PoolFactory factory,
  DelegateCallProxyManager proxyManager
)
```

Deploy the controller and configure the addresses
of the related contracts.

# Controls

## `setOwner` 

```
function setOwner(address owner)
```



Set the address of the ndx contract.
After deployment this will likely never change, but it is useful
to have some small window during which things can be initialized
before governance is fully in place.

## `setDefaultSellerPremium` 

```
function setDefaultSellerPremium(uint8 _defaultSellerPremium)
```



Sets the default premium rate for token seller contracts.

## `emergencyExecuteSwapTokensForExactTokens` 

```
function emergencyExecuteSwapTokensForExactTokens(
  address sellerAddress,
  address tokenIn,
  address tokenOut,
  uint256 maxAmountIn,
  uint256 amountOut,
  address[] path
)
```

Emergency function that allows the dao to force a token sale
through UniSwap. This exists in case of an emergency which demands
immediate removal of a token.

# Pool Deployment

## `prepareIndexPool` 

```
function prepareIndexPool(
  uint256 categoryID,
  uint256 indexSize,
  uint256 initialWethValue,
  string name,
  string symbol
)
```

Deploys an index pool and a pool initializer.
The initializer contract is a pool with specific token
balance targets which gives pool tokens in the finished
pool to users who provide the underlying tokens needed
to initialize it.

## `finishPreparedIndexPool` 

```
function finishPreparedIndexPool(
  address poolAddress,
  address[] tokens,
  uint256[] balances
)
```

Initializes a pool which has been deployed but not initialized
and transfers the underlying tokens from the initialization pool to
the actual pool.

# Pool Management

## `updateSellerPremiumToDefault` 

```
function updateSellerPremiumToDefault(
  address sellerAddress
)
```



Update the premium rate on `sellerAddress` with the current
default rate.

## `updateSellerPremiumToDefault` 

```
function updateSellerPremiumToDefault(
  address[] sellerAddresses
)
```



Update the premium rate on each unbound token seller in
`sellerAddresses` with the current default rate.

## `setSwapFee` 

```
function setSwapFee(address poolAddress, uint256 swapFee)
```



Sets the swap fee on an index pool.

## `pausePublicTrading` 

```
function pausePublicTrading(address poolAddress)
```



Freezes public trading and liquidity providing on an index pool.

## `resumePublicTrading` 

```
function resumePublicTrading(address poolAddress)
```



Resumes public trading and liquidity providing on an index pool.

## `removeTokenFromPool` 

```
function removeTokenFromPool(
  address poolAddress, 
  address tokenAddress
)
```

Forcibly removes a token from a pool.
This should only be used as a last resort if a token is experiencing
a sudden crash or major vulnerability. Otherwise, tokens should only
be removed gradually through re-indexing events.

# Category Management

## `createCategory` 

```
function createCategory(bytes32 metadataHash)
```



Create a new token category.


## `addToken` 

```
function addToken(address token, uint256 categoryID)
```



Adds a new token to a category.
Note: A token can only be assigned to one category at a time.

## `addTokens` 

```
function addTokens(uint256 categoryID, address[] tokens)
```

Add tokens to a category.


## `orderCategoryTokensByMarketCap` 

```
function orderCategoryTokensByMarketCap(uint256 categoryID, address[] orderedTokens)
```



Sorts a category's tokens in descending order by market cap.
Verifies the order of the provided array by querying the market caps.

# Pool Rebalancing

## `reindexPool` 

```
function reindexPool(address poolAddress)
```



Re-indexes a pool by setting the underlying assets to the top
tokens in its category by market cap.

## `reweighPool` 

```
function reweighPool(address poolAddress)
```



Reweighs the assets in a pool by market cap and sets the
desired new weights, which will be adjusted over time.

## `setMinimumBalance` 

```
function setMinimumBalance(
  IPool pool,
  address tokenAddress
)
```

Updates the minimum balance of an uninitialized token, which is
useful when the token's price on the pool is too low relative to
external prices for people to trade it in.

# Pool Queries

# `defaultSellerPremium`

```
function defaultSellerPremium() returns (uint256 defaultSellerPremium)
```

Default premium percent for index pool's unbound token sellers.

## `computeInitializerAddress` 

```
function computeInitializerAddress(address poolAddress) returns (address initializerAddress)
```



Compute the create2 address for a pool initializer.

## `computePoolAddress` 

```
function computePoolAddress(uint256 categoryID, uint256 indexSize) returns (address poolAddress)
```

Compute the create2 address for a pool.

## `getInitialTokenWeightsAndBalances` 

```
function getInitialTokenWeightsAndBalances(
  uint256 categoryID,
  uint256 indexSize,
  uint256 wethValue
) returns (address[] tokens, uint96[] denormalizedWeights, uint256[] balances)
```

Queries the top `indexSize` tokens in a category from the market _oracle, computes their relative weights by market cap square root and determines the weighted balance of each token to meet a specified total value in weth.

## `getInitialTokensAndBalances` 

```
function getInitialTokensAndBalances(
  uint256 categoryID,
  uint256 indexSize,
  uint256 wethValue
) returns (address[] tokens, uint256[] balances)
```

Queries the top `indexSize` tokens in a category from the market _oracle, computes their relative weights by market cap square root and determines the weighted balance of each token to meet a specified total value.

# Market Cap Queries

## `computeAverageMarketCap` 

```
function computeAverageMarketCap(
  address token
) returns (uint144 marketCap)
```

Compute the average market cap of a token in WETH.
Queries the average amount of ether that the total supply is worth
using the recent moving average.

## `computeAverageMarketCaps` 

```
function computeAverageMarketCaps(
  address[] tokens
) returns (uint144[] marketCaps)
```

Returns the average market cap for each token.

# Category Queries

## `categoryIndex`

```
function categoryIndex() returns (uint256 categoryID)
```

Number of categories in the oracle.

## `hasCategory` 

```
function hasCategory(uint256 categoryID) returns (bool)
```

Returns a boolean stating whether a category exists.

## `getCategoryTokens` 

```
function getCategoryTokens(
  uint256 categoryID
) returns (address[] tokens)
```



Returns the array of tokens in a category.

## `getCategoryMarketCaps` 

```
function getCategoryMarketCaps(
  uint256 categoryID
) returns (uint144[] marketCaps)
```



Returns the market capitalization rates for the tokens
in a category.

## `getTopCategoryTokens` 

```
function getTopCategoryTokens(
  uint256 categoryID,
  uint256 num
) returns (address[] tokens)
```

Get the top `num` tokens in a category.
Note: The category must have been sorted by market cap
in the last `MAX_SORT_DELAY` seconds.
