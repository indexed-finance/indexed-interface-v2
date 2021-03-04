## `ManyToOneImplementationHolder`



The ManyToOneImplementationHolder stores an upgradeable implementation address
in storage, which many-to-one proxies query at execution time to determine which
contract to delegate to.
The manager can upgrade the implementation address by calling the holder with the
abi-encoded address as calldata. If any other account calls the implementation holder,
it will return the implementation address.
This pattern was inspired by the DharmaUpgradeBeacon from 0age
https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/upgradeability/smart-wallet/DharmaUpgradeBeacon.sol

# Functions:
- [`fallback()`](#ManyToOneImplementationHolder-fallback--)

## <a id='ManyToOneImplementationHolder-fallback--'></a> `fallback`

```
function fallback()
```



Fallback function for the contract.
Used by proxies to read the implementation address and used
by the proxy manager to set the implementation address.
If called by the owner, reads the implementation address from
calldata (must be abi-encoded) and stores it to the first slot.
Otherwise, returns the stored implementation address.


