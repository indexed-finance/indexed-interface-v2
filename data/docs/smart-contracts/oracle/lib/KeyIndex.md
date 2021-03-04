# `KeyIndex`



Library for indexing keys stored in a sequential mapping for easier
queries.
Every set of 256 keys in the value map is assigned a single index which
records set values as bits, where 1 indicates the map has a value at a given
key and 0 indicates it does not.

The 'value map' is the map which stores the values with sequential keys.

The 'key index' is the mapping which stores the indices for each 256 values
in the map. For example, the key '256' in the value map would have a key
in the key index of `1`, where the 0th bit in the index records whether a
value is set in the value map .

# Functions:
- [`toMapKey(uint256 indexKey, uint256 indexPosition)`](#KeyIndex-toMapKey-uint256-uint256-)
- [`indexKeyAndPosition(uint256 mapKey)`](#KeyIndex-indexKeyAndPosition-uint256-)
- [`markSetKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey)`](#KeyIndex-markSetKey-mapping-uint256----uint256--uint256-)
- [`hasKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey)`](#KeyIndex-hasKey-mapping-uint256----uint256--uint256-)
- [`getEncodedSetKeysInRange(mapping(uint256 => uint256) keyIndex, uint256 mapKeyFrom, uint256 mapKeyTo)`](#KeyIndex-getEncodedSetKeysInRange-mapping-uint256----uint256--uint256-uint256-)
- [`findLastSetKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey, uint256 maxDistance)`](#KeyIndex-findLastSetKey-mapping-uint256----uint256--uint256-uint256-)
- [`findNextSetKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey, uint256 maxDistance)`](#KeyIndex-findNextSetKey-mapping-uint256----uint256--uint256-uint256-)

## <a id='KeyIndex-toMapKey-uint256-uint256-'></a> `toMapKey`

```
function toMapKey(uint256 indexKey, uint256 indexPosition) returns (uint256)
```



Compute the map key for a given index key and position.
Multiplies indexKey by 256 and adds indexPosition.


## <a id='KeyIndex-indexKeyAndPosition-uint256-'></a> `indexKeyAndPosition`

```
function indexKeyAndPosition(uint256 mapKey) returns (uint256 indexKey, uint256 indexPosition)
```



Returns the key in the key index which stores the index for the 256-bit
index which includes `mapKey` and the position in the index for that key.


## <a id='KeyIndex-markSetKey-mapping-uint256----uint256--uint256-'></a> `markSetKey`

```
function markSetKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey) returns (bool)
```



Sets a bit at the position in `indexMap` corresponding to `mapKey` if the
bit is not already set.


## Parameters:
- `keyIndex`: Mapping with indices of set keys in the value map

- `mapKey`: Position in the value map to mark as set

## <a id='KeyIndex-hasKey-mapping-uint256----uint256--uint256-'></a> `hasKey`

```
function hasKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey) returns (bool)
```



Returns a boolean indicating whether a value is stored for `mapKey` in the map index.


## <a id='KeyIndex-getEncodedSetKeysInRange-mapping-uint256----uint256--uint256-uint256-'></a> `getEncodedSetKeysInRange`

```
function getEncodedSetKeysInRange(mapping(uint256 => uint256) keyIndex, uint256 mapKeyFrom, uint256 mapKeyTo) returns (bytes bitPositions)
```



Returns a packed uint16 array with the offsets of all set keys
between `mapKeyFrom` and `mapKeyTo`. Offsets are relative to `mapKeyFrom`


## <a id='KeyIndex-findLastSetKey-mapping-uint256----uint256--uint256-uint256-'></a> `findLastSetKey`

```
function findLastSetKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey, uint256 maxDistance) returns (bool, uint256)
```



Find the most recent position before `mapKey` which the index map records
as having a set value. Returns the key in the value map for that position.


## Parameters:
- `keyIndex`: Mapping with indices of set keys in the value map

- `mapKey`: Position in the value map to look behind

- `maxDistance`: Maximum distance between the found value and `mapKey`

## <a id='KeyIndex-findNextSetKey-mapping-uint256----uint256--uint256-uint256-'></a> `findNextSetKey`

```
function findNextSetKey(mapping(uint256 => uint256) keyIndex, uint256 mapKey, uint256 maxDistance) returns (bool, uint256)
```



Find the next position after `mapKey` which the index map records as
having a set value. Returns the key in the value map for that position.


## Parameters:
- `keyIndex`: Mapping with indices of set values in the value map

- `mapKey`: Position in the value map to look ahead

- `maxDistance`: Maximum distance between the found value and `mapKey`

