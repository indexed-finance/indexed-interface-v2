## `DelegateCallProxyManyToOne`

Proxy contract which uses an implementation address shared with many
other proxies.
An implementation holder contract stores the upgradeable implementation address.
When the proxy is called, it queries the implementation address from the holder
contract and delegatecalls the returned address, forwarding the received calldata
and ether.
Note: This contract does not verify that the implementation
address is a valid delegation target. The manager must perform
this safety check before updating the implementation on the holder.

# Functions:
- [`_implementation()`](#DelegateCallProxyManyToOne-_implementation--)

## <a id='DelegateCallProxyManyToOne-_implementation--'></a> `_implementation`

```
function _implementation() returns (address)
```



Queries the implementation address from the implementation holder.


