# `PriceLibrary`





# Functions:
- [`pairInitialized(address uniswapFactory, address token, address weth)`](#PriceLibrary-pairInitialized-address-address-address-)
- [`observePrice(address uniswapFactory, address tokenIn, address quoteToken)`](#PriceLibrary-observePrice-address-address-address-)
- [`observeTwoWayPrice(address uniswapFactory, address token, address weth)`](#PriceLibrary-observeTwoWayPrice-address-address-address-)
- [`computeTwoWayAveragePrice(struct PriceLibrary.PriceObservation observation1, struct PriceLibrary.PriceObservation observation2)`](#PriceLibrary-computeTwoWayAveragePrice-struct-PriceLibrary-PriceObservation-struct-PriceLibrary-PriceObservation-)
- [`computeAveragePrice(uint32 timestampStart, uint224 priceCumulativeStart, uint32 timestampEnd, uint224 priceCumulativeEnd)`](#PriceLibrary-computeAveragePrice-uint32-uint224-uint32-uint224-)
- [`computeAverageTokenPrice(struct PriceLibrary.PriceObservation observation1, struct PriceLibrary.PriceObservation observation2)`](#PriceLibrary-computeAverageTokenPrice-struct-PriceLibrary-PriceObservation-struct-PriceLibrary-PriceObservation-)
- [`computeAverageEthPrice(struct PriceLibrary.PriceObservation observation1, struct PriceLibrary.PriceObservation observation2)`](#PriceLibrary-computeAverageEthPrice-struct-PriceLibrary-PriceObservation-struct-PriceLibrary-PriceObservation-)
- [`computeAverageEthForTokens(struct PriceLibrary.TwoWayAveragePrice prices, uint256 tokenAmount)`](#PriceLibrary-computeAverageEthForTokens-struct-PriceLibrary-TwoWayAveragePrice-uint256-)
- [`computeAverageTokensForEth(struct PriceLibrary.TwoWayAveragePrice prices, uint256 wethAmount)`](#PriceLibrary-computeAverageTokensForEth-struct-PriceLibrary-TwoWayAveragePrice-uint256-)

## <a id='PriceLibrary-pairInitialized-address-address-address-'></a> `pairInitialized`

```
function pairInitialized(address uniswapFactory, address token, address weth) returns (bool)
```






## <a id='PriceLibrary-observePrice-address-address-address-'></a> `observePrice`

```
function observePrice(address uniswapFactory, address tokenIn, address quoteToken) returns (uint32, uint224)
```






## <a id='PriceLibrary-observeTwoWayPrice-address-address-address-'></a> `observeTwoWayPrice`

```
function observeTwoWayPrice(address uniswapFactory, address token, address weth) returns (struct PriceLibrary.PriceObservation)
```



Query the current cumulative price of a token in terms of weth
and the current cumulative price of weth in terms of the token.


## <a id='PriceLibrary-computeTwoWayAveragePrice-struct-PriceLibrary-PriceObservation-struct-PriceLibrary-PriceObservation-'></a> `computeTwoWayAveragePrice`

```
function computeTwoWayAveragePrice(struct PriceLibrary.PriceObservation observation1, struct PriceLibrary.PriceObservation observation2) returns (struct PriceLibrary.TwoWayAveragePrice)
```



Computes the average price of a token in terms of weth
and the average price of weth in terms of a token using two
price observations.


## <a id='PriceLibrary-computeAveragePrice-uint32-uint224-uint32-uint224-'></a> `computeAveragePrice`

```
function computeAveragePrice(uint32 timestampStart, uint224 priceCumulativeStart, uint32 timestampEnd, uint224 priceCumulativeEnd) returns (struct FixedPoint.uq112x112)
```






## <a id='PriceLibrary-computeAverageTokenPrice-struct-PriceLibrary-PriceObservation-struct-PriceLibrary-PriceObservation-'></a> `computeAverageTokenPrice`

```
function computeAverageTokenPrice(struct PriceLibrary.PriceObservation observation1, struct PriceLibrary.PriceObservation observation2) returns (struct FixedPoint.uq112x112)
```



Computes the average price of the token the price observations
are for in terms of weth.


## <a id='PriceLibrary-computeAverageEthPrice-struct-PriceLibrary-PriceObservation-struct-PriceLibrary-PriceObservation-'></a> `computeAverageEthPrice`

```
function computeAverageEthPrice(struct PriceLibrary.PriceObservation observation1, struct PriceLibrary.PriceObservation observation2) returns (struct FixedPoint.uq112x112)
```



Computes the average price of weth in terms of the token
the price observations are for.


## <a id='PriceLibrary-computeAverageEthForTokens-struct-PriceLibrary-TwoWayAveragePrice-uint256-'></a> `computeAverageEthForTokens`

```
function computeAverageEthForTokens(struct PriceLibrary.TwoWayAveragePrice prices, uint256 tokenAmount) returns (uint144)
```



Compute the average value in weth of `tokenAmount` of the
token that the average price values are for.


## <a id='PriceLibrary-computeAverageTokensForEth-struct-PriceLibrary-TwoWayAveragePrice-uint256-'></a> `computeAverageTokensForEth`

```
function computeAverageTokensForEth(struct PriceLibrary.TwoWayAveragePrice prices, uint256 wethAmount) returns (uint144)
```



Compute the average value of `wethAmount` weth in terms of
the token that the average price values are for.


