# `DelegateCallProxyOneToOne`

Upgradeable delegatecall proxy for a single contract.

This proxy stores an implementation address which can be upgraded by the proxy manager.

To upgrade the implementation, the manager calls the proxy with the abi encoded implementation address.

If any other account calls the proxy, it will delegatecall the implementation address with the received calldata and ether.

If the call succeeds, it will return with the received returndata.
If it reverts, it will revert with the received revert data.

## Notes

The storage slot for the implementation address is: `bytes32(uint256(keccak256("IMPLEMENTATION_ADDRESS")) + 1)`. This slot must not be used by the implementation contract.

This contract does not verify that the implementation address is a valid delegation target. The manager must perform this safety check.

# Functions
  - [<a id='DelegateCallProxyOneToOne-_implementation--'></a> `_implementation`](#-_implementation)
  - [<a id='DelegateCallProxyOneToOne-_beforeFallback--'></a> `_beforeFallback`](#-_beforefallback)

## <a id='DelegateCallProxyOneToOne-_implementation--'></a> `_implementation`

```
function _implementation() returns (address)
```



Reads the implementation address from storage.


## <a id='DelegateCallProxyOneToOne-_beforeFallback--'></a> `_beforeFallback`

```
function _beforeFallback()
```



Hook that is called before falling back to the implementation.
Checks if the call is from the owner.
If it is, reads the abi-encoded implementation address from calldata and stores
it at the slot `bytes32(uint256(keccak256("IMPLEMENTATION_ADDRESS")) + 1)`,
then returns with no data.
If it is not, continues execution with the fallback function.


