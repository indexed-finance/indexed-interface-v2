# `IndexedUniswapV2Oracle`





# Functions:
- [`constructor(address uniswapFactory, address weth)`](#IndexedUniswapV2Oracle-constructor-address-address-)
- [`updatePrice(address token)`](#IndexedUniswapV2Oracle-updatePrice-address-)
- [`updatePrices(address[] tokens)`](#IndexedUniswapV2Oracle-updatePrices-address---)
- [`hasPriceObservationInWindow(address token, uint256 priceKey)`](#IndexedUniswapV2Oracle-hasPriceObservationInWindow-address-uint256-)
- [`getPriceObservationInWindow(address token, uint256 priceKey)`](#IndexedUniswapV2Oracle-getPriceObservationInWindow-address-uint256-)
- [`getPriceObservationsInRange(address token, uint256 timeFrom, uint256 timeTo)`](#IndexedUniswapV2Oracle-getPriceObservationsInRange-address-uint256-uint256-)
- [`canUpdatePrice(address token)`](#IndexedUniswapV2Oracle-canUpdatePrice-address-)
- [`canUpdatePrices(address[] tokens)`](#IndexedUniswapV2Oracle-canUpdatePrices-address---)
- [`computeTwoWayAveragePrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeTwoWayAveragePrice-address-uint256-uint256-)
- [`computeAverageTokenPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageTokenPrice-address-uint256-uint256-)
- [`computeAverageEthPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageEthPrice-address-uint256-uint256-)
- [`computeTwoWayAveragePrices(address[] tokens, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeTwoWayAveragePrices-address---uint256-uint256-)
- [`computeAverageTokenPrices(address[] tokens, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageTokenPrices-address---uint256-uint256-)
- [`computeAverageEthPrices(address[] tokens, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageEthPrices-address---uint256-uint256-)
- [`computeAverageEthForTokens(address token, uint256 tokenAmount, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageEthForTokens-address-uint256-uint256-uint256-)
- [`computeAverageTokensForEth(address token, uint256 wethAmount, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageTokensForEth-address-uint256-uint256-uint256-)
- [`computeAverageEthForTokens(address[] tokens, uint256[] tokenAmounts, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageEthForTokens-address---uint256---uint256-uint256-)
- [`computeAverageTokensForEth(address[] tokens, uint256[] wethAmounts, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-computeAverageTokensForEth-address---uint256---uint256-uint256-)
- [`_getTwoWayPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-_getTwoWayPrice-address-uint256-uint256-)
- [`_getTokenPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-_getTokenPrice-address-uint256-uint256-)
- [`_getEthPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedUniswapV2Oracle-_getEthPrice-address-uint256-uint256-)

## <a id='IndexedUniswapV2Oracle-constructor-address-address-'></a> `constructor`

```
function constructor(address uniswapFactory, address weth)
```

## <a id='IndexedUniswapV2Oracle-updatePrice-address-'></a> `updatePrice`

```
function updatePrice(address token) returns (bool)
```



Attempts to update the price of `token` and returns a boolean
indicating whether it was updated.

**Note:** The price can be updated if there is no observation for the current hour
and at least 30 minutes have passed since the last observation.


## <a id='IndexedUniswapV2Oracle-updatePrices-address---'></a> `updatePrices`

```
function updatePrices(address[] tokens) returns (bool[] pricesUpdated)
```

Attempts to update the price of each token in `tokens` and returns a boolean
array indicating which tokens had their prices updated.

**Note:** The price can be updated if there is no observation for the current hour
and at least 30 minutes have passed since the last observation.


## <a id='IndexedUniswapV2Oracle-hasPriceObservationInWindow-address-uint256-'></a> `hasPriceObservationInWindow`

```
function hasPriceObservationInWindow(address token, uint256 priceKey) returns (bool)
```



Returns a boolean indicating whether a price was recorded for `token` at `priceKey`.


### Parameters:
- `token`: Token to check if the oracle has a price for

- `priceKey`: Index of the hour to check

## <a id='IndexedUniswapV2Oracle-getPriceObservationInWindow-address-uint256-'></a> `getPriceObservationInWindow`

```
function getPriceObservationInWindow(address token, uint256 priceKey) returns (struct PriceLibrary.PriceObservation observation)
```

Returns the price observation for `token` recorded in `priceKey`.
Reverts if no prices have been recorded for that key.


### Parameters:
- `token`: Token to retrieve a price for

- `priceKey`: Index of the hour to query

## <a id='IndexedUniswapV2Oracle-getPriceObservationsInRange-address-uint256-uint256-'></a> `getPriceObservationsInRange`

```
function getPriceObservationsInRange(address token, uint256 timeFrom, uint256 timeTo) returns (struct PriceLibrary.PriceObservation[] prices)
```

Returns all price observations for `token` recorded between `timeFrom` and `timeTo`.


## <a id='IndexedUniswapV2Oracle-canUpdatePrice-address-'></a> `canUpdatePrice`

```
function canUpdatePrice(address token) returns (bool)
```


Returns a boolean indicating whether the price of `token` can be updated.

**Note:** The price can be updated if there is no observation for the current hour
and at least 30 minutes have passed since the last observation.


## <a id='IndexedUniswapV2Oracle-canUpdatePrices-address---'></a> `canUpdatePrices`

```
function canUpdatePrices(address[] tokens) returns (bool[] canUpdateArr)
```

Returns a boolean array indicating whether the price of each token in
`tokens` can be updated.

**Note:** The price can be updated if there is no observation for the current hour
and at least 30 minutes have passed since the last observation.


## <a id='IndexedUniswapV2Oracle-computeTwoWayAveragePrice-address-uint256-uint256-'></a> `computeTwoWayAveragePrice`

```
function computeTwoWayAveragePrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct PriceLibrary.TwoWayAveragePrice)
```



Returns the TwoWayAveragePrice struct representing the average price of
weth in terms of `token` and the average price of `token` in terms of weth.

Computes the time-weighted average price of weth in terms of `token` and the price
of `token` in terms of weth by getting the current prices from Uniswap and searching
for a historical price which is between `minTimeElapsed` and `maxTimeElapsed` seconds old.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.

**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageTokenPrice-address-uint256-uint256-'></a> `computeAverageTokenPrice`

```
function computeAverageTokenPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct FixedPoint.uq112x112 priceAverage)
```



Returns the UQ112x112 struct representing the average price of
`token` in terms of weth.

Computes the time-weighted average price of `token` in terms of weth by getting the
current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.

**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageEthPrice-address-uint256-uint256-'></a> `computeAverageEthPrice`

```
function computeAverageEthPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct FixedPoint.uq112x112 priceAverage)
```

Returns the UQ112x112 struct representing the average price of
weth in terms of `token`.

Computes the time-weighted average price of weth in terms of `token` by getting the
current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.

**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeTwoWayAveragePrices-address---uint256-uint256-'></a> `computeTwoWayAveragePrices`

```
function computeTwoWayAveragePrices(address[] tokens, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct PriceLibrary.TwoWayAveragePrice[] prices)
```

Returns the TwoWayAveragePrice structs representing the average price of
weth in terms of each token in `tokens` and the average price of each token
in terms of weth.

Computes the time-weighted average price of weth in terms of each token and the price
of each token in terms of weth by getting the current prices from Uniswap and searching
for a historical price which is between `minTimeElapsed` and `maxTimeElapsed` seconds old.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.

**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageTokenPrices-address---uint256-uint256-'></a> `computeAverageTokenPrices`

```
function computeAverageTokenPrices(address[] tokens, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct FixedPoint.uq112x112[] averagePrices)
```

Returns the UQ112x112 structs representing the average price of
each token in `tokens` in terms of weth.

Computes the time-weighted average price of each token in terms of weth by getting
the current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.

**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageEthPrices-address---uint256-uint256-'></a> `computeAverageEthPrices`

```
function computeAverageEthPrices(address[] tokens, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct FixedPoint.uq112x112[] averagePrices)
```



Returns the UQ112x112 structs representing the average price of
weth in terms of each token in `tokens`.

Computes the time-weighted average price of weth in terms of each token by getting
the current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.
**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageEthForTokens-address-uint256-uint256-uint256-'></a> `computeAverageEthForTokens`

```
function computeAverageEthForTokens(address token, uint256 tokenAmount, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (uint144)
```



Compute the average value of `tokenAmount` ether in terms of weth.
Computes the time-weighted average price of `token` in terms of weth by getting
the current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old, then multiplies by `wethAmount`.
**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.
**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageTokensForEth-address-uint256-uint256-uint256-'></a> `computeAverageTokensForEth`

```
function computeAverageTokensForEth(address token, uint256 wethAmount, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (uint144)
```



Compute the average value of `wethAmount` ether in terms of `token`.
Computes the time-weighted average price of weth in terms of the token by getting
the current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old, then multiplies by `wethAmount`.
**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.
**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageEthForTokens-address---uint256---uint256-uint256-'></a> `computeAverageEthForTokens`

```
function computeAverageEthForTokens(address[] tokens, uint256[] tokenAmounts, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (uint144[] averageValuesInWETH)
```



Compute the average value of each amount of tokens in `tokenAmounts` in terms
of the corresponding token in `tokens`.
Computes the time-weighted average price of each token in terms of weth by getting
the current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old, then multiplies by the corresponding
amount in `tokenAmounts`.
**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.
**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-computeAverageTokensForEth-address---uint256---uint256-uint256-'></a> `computeAverageTokensForEth`

```
function computeAverageTokensForEth(address[] tokens, uint256[] wethAmounts, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (uint144[] averageValuesInWETH)
```



Compute the average value of each amount of ether in `wethAmounts` in terms
of the corresponding token in `tokens`.
Computes the time-weighted average price of weth in terms of each token by getting
the current price from Uniswap and searching for a historical price which is between
`minTimeElapsed` and `maxTimeElapsed` seconds old, then multiplies by the corresponding
amount in `wethAmounts`.
**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is less than one hour.
**Note:** `minTimeElapsed` is only accurate to the nearest hour (rounded up) unless
it is less than one hour.


## <a id='IndexedUniswapV2Oracle-_getTwoWayPrice-address-uint256-uint256-'></a> `_getTwoWayPrice`

```
function _getTwoWayPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct PriceLibrary.TwoWayAveragePrice)
```






## <a id='IndexedUniswapV2Oracle-_getTokenPrice-address-uint256-uint256-'></a> `_getTokenPrice`

```
function _getTokenPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct FixedPoint.uq112x112)
```






## <a id='IndexedUniswapV2Oracle-_getEthPrice-address-uint256-uint256-'></a> `_getEthPrice`

```
function _getEthPrice(address token, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (struct FixedPoint.uq112x112)
```






