# `Bits`





# Functions:
- [`setBit(uint256 self, uint256 index)`](#Bits-setBit-uint256-uint256-)
- [`bitSet(uint256 self, uint256 index)`](#Bits-bitSet-uint256-uint256-)
- [`clearBitsAfter(uint256 self, uint256 index)`](#Bits-clearBitsAfter-uint256-uint256-)
- [`clearBitsBefore(uint256 self, uint256 index)`](#Bits-clearBitsBefore-uint256-uint256-)
- [`writeSetBits(bytes bitPositions, uint256 val, uint16 offset)`](#Bits-writeSetBits-bytes-uint256-uint16-)
- [`highestBitSet(uint256 self)`](#Bits-highestBitSet-uint256-)
- [`lowestBitSet(uint256 self)`](#Bits-lowestBitSet-uint256-)
- [`nextLowestBitSet(uint256 self, uint256 bit)`](#Bits-nextLowestBitSet-uint256-uint256-)
- [`nextHighestBitSet(uint256 self, uint256 bit)`](#Bits-nextHighestBitSet-uint256-uint256-)

## <a id='Bits-setBit-uint256-uint256-'></a> `setBit`

```
function setBit(uint256 self, uint256 index) returns (uint256)
```



Sets the bit at the given 'index' in 'self' to '1'.
Returns the modified value.


## <a id='Bits-bitSet-uint256-uint256-'></a> `bitSet`

```
function bitSet(uint256 self, uint256 index) returns (bool)
```



Returns a boolean indicating whether the bit at the given `index` in `self` is set.


## <a id='Bits-clearBitsAfter-uint256-uint256-'></a> `clearBitsAfter`

```
function clearBitsAfter(uint256 self, uint256 index) returns (uint256)
```



Clears all bits in the exclusive range [index:255]


## <a id='Bits-clearBitsBefore-uint256-uint256-'></a> `clearBitsBefore`

```
function clearBitsBefore(uint256 self, uint256 index) returns (uint256)
```



Clears bits in the exclusive range [0:index]


## <a id='Bits-writeSetBits-bytes-uint256-uint16-'></a> `writeSetBits`

```
function writeSetBits(bytes bitPositions, uint256 val, uint16 offset)
```



Writes the index of every set bit in `val` as a uint16 in `bitPositions`.
Adds `offset` to the stored bit index.
`bitPositions` must have a length equal to twice the maximum number of bits that
could be found plus 31. Each index is stored as a uint16 to accomodate `offset`
because this is used in functions which would otherwise need expensive methods
to handle relative indices in multi-integer searches.
The specified length ensures that solc will handle memory allocation, and the
addition of 31 allows us to store whole words at a time.
After being declared, the actual length stored in memory must be set to 0 with:
`assembly { mstore(bitPositions, 0) }` because the length is used to count found bits.


## Parameters:
- `bitPositions`: Packed uint16 array for positions of set bits

- `val`: Value to search set bits in

- `offset`: Value added to the stored position, used to simplify large searches.

## <a id='Bits-highestBitSet-uint256-'></a> `highestBitSet`

```
function highestBitSet(uint256 self) returns (uint256 r)
```



Returns the index of the highest bit set in `self`.
Note: Requires that `self != 0`


## <a id='Bits-lowestBitSet-uint256-'></a> `lowestBitSet`

```
function lowestBitSet(uint256 self) returns (uint256 _z)
```



Returns the index of the lowest bit set in `self`.
Note: Requires that `self != 0`


## <a id='Bits-nextLowestBitSet-uint256-uint256-'></a> `nextLowestBitSet`

```
function nextLowestBitSet(uint256 self, uint256 bit) returns (bool haveValueBefore, uint256 previousBit)
```



Returns a boolean indicating whether `bit` is the highest set bit
in the integer and the index of the next lowest set bit if it is not.


## <a id='Bits-nextHighestBitSet-uint256-uint256-'></a> `nextHighestBitSet`

```
function nextHighestBitSet(uint256 self, uint256 bit) returns (bool haveValueAfter, uint256 nextBit)
```



Returns a boolean indicating whether `bit` is the lowest set bit
in the integer and the index of the next highest set bit if it is not.


