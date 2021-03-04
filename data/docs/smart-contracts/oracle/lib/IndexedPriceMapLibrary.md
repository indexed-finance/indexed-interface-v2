# `IndexedPriceMapLibrary`

# Functions:
- [`toPriceKey(uint256 timestamp)`](#IndexedPriceMapLibrary-toPriceKey-uint256-)
- [`timeElapsedSinceWindowStart(uint256 timestamp)`](#IndexedPriceMapLibrary-timeElapsedSinceWindowStart-uint256-)
- [`writePriceObservation(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, struct PriceLibrary.PriceObservation observation)`](#IndexedPriceMapLibrary-writePriceObservation-struct-IndexedPriceMapLibrary-IndexedPriceMap-struct-PriceLibrary-PriceObservation-)
- [`sufficientDelaySinceLastPrice(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint32 newTimestamp)`](#IndexedPriceMapLibrary-sufficientDelaySinceLastPrice-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint32-)
- [`canUpdatePrice(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint32 newTimestamp)`](#IndexedPriceMapLibrary-canUpdatePrice-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint32-)
- [`hasPriceInWindow(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 priceKey)`](#IndexedPriceMapLibrary-hasPriceInWindow-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-)
- [`getPriceInWindow(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 priceKey)`](#IndexedPriceMapLibrary-getPriceInWindow-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-)
- [`getPriceObservationsInRange(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 timeFrom, uint256 timeTo)`](#IndexedPriceMapLibrary-getPriceObservationsInRange-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-uint256-)
- [`getLastPriceObservation(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 timestamp, uint256 minTimeElapsed, uint256 maxTimeElapsed)`](#IndexedPriceMapLibrary-getLastPriceObservation-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-uint256-uint256-)

## <a id='IndexedPriceMapLibrary-toPriceKey-uint256-'></a> `toPriceKey`

```
function toPriceKey(uint256 timestamp) returns (uint256)
```



Returns the price key for `timestamp`, which is the hour index.


## <a id='IndexedPriceMapLibrary-timeElapsedSinceWindowStart-uint256-'></a> `timeElapsedSinceWindowStart`

```
function timeElapsedSinceWindowStart(uint256 timestamp) returns (uint256)
```



Returns the number of seconds that have passed since the beginning of the hour.


## <a id='IndexedPriceMapLibrary-writePriceObservation-struct-IndexedPriceMapLibrary-IndexedPriceMap-struct-PriceLibrary-PriceObservation-'></a> `writePriceObservation`

```
function writePriceObservation(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, struct PriceLibrary.PriceObservation observation) returns (bool)
```

Writes `observation` to storage if the price can be updated. If it is
updated, also marks the price key for the observation as having a value in
the key index.

**Note:** The price can be updated if there is none recorded for the current
hour 30 minutes have passed since the last price update.
Returns a boolean indicating whether the price was updated.


## <a id='IndexedPriceMapLibrary-sufficientDelaySinceLastPrice-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint32-'></a> `sufficientDelaySinceLastPrice`

```
function sufficientDelaySinceLastPrice(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint32 newTimestamp) returns (bool)
```

Checks whether sufficient time has passed since the beginning of the observation
window or since the price recorded in the previous window (if any) for a new price
to be recorded.


## <a id='IndexedPriceMapLibrary-canUpdatePrice-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint32-'></a> `canUpdatePrice`

```
function canUpdatePrice(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint32 newTimestamp) returns (bool)
```

Checks if a price can be updated. Prices can be updated if there is no price
observation for the current hour and at least 30 minutes have passed since the
observation in the previous hour (if there is one).


## <a id='IndexedPriceMapLibrary-hasPriceInWindow-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-'></a> `hasPriceInWindow`

```
function hasPriceInWindow(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 priceKey) returns (bool)
```

Checks the key index to see if a price is recorded for `priceKey`


## <a id='IndexedPriceMapLibrary-getPriceInWindow-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-'></a> `getPriceInWindow`

```
function getPriceInWindow(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 priceKey) returns (struct PriceLibrary.PriceObservation)
```



Returns the price observation for `priceKey`


## <a id='IndexedPriceMapLibrary-getPriceObservationsInRange-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-uint256-'></a> `getPriceObservationsInRange`

```
function getPriceObservationsInRange(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 timeFrom, uint256 timeTo) returns (struct PriceLibrary.PriceObservation[] prices)
```


## <a id='IndexedPriceMapLibrary-getLastPriceObservation-struct-IndexedPriceMapLibrary-IndexedPriceMap-uint256-uint256-uint256-'></a> `getLastPriceObservation`

```
function getLastPriceObservation(struct IndexedPriceMapLibrary.IndexedPriceMap indexedPriceMap, uint256 timestamp, uint256 minTimeElapsed, uint256 maxTimeElapsed) returns (bool, uint256)
```



Finds the most recent price observation before `timestamp` with a minimum
difference in observation times of `minTimeElapsed` and a maximum difference in
observation times of `maxTimeElapsed`.

**Note:** `maxTimeElapsed` is only accurate to the nearest hour (rounded down) unless
it is below one hour.


## Parameters:
- `indexedPriceMap`: Struct with the indexed price mapping for the token.

- `timestamp`: Timestamp to search backwards from.

- `minTimeElapsed`: Minimum time elapsed between price observations.

- `maxTimeElapsed`: Maximum time elapsed between price observations.
Only accurate to the nearest hour (rounded down) unless it is below 1 hour.

