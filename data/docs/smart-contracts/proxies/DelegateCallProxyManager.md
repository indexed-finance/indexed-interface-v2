## `DelegateCallProxyManager`



Contract that manages deployment and upgrades of delegatecall proxies.
An implementation identifier can be created on the proxy manager which is
used to specify the logic address for a particular contract type, and to
upgrade the implementation as needed.

## **Proxy Types**
A [one-to-one proxy](./DelegateCallProxyOneToOne.md) is a single proxy contract with an upgradeable implementation
address.

A [many-to-one proxy](./DelegateCallProxyManyToOne.md) is a single upgradeable implementation address that may be
used by many proxy contracts.

## **Access Control**
The proxy manager has a single address as its owner.
The owner is the sole account with the following permissions:
- Create new many-to-one implementations
- Create new one-to-one proxies
- Modify the implementation address of existing proxies
- Lock proxies
- Designate approved deployers
- Remove approved deployers
- Modify the owner address

Approved deployers may only deploy many-to-one proxies.
## **Upgrades**
Proxies can be upgraded by the owner if they are not locked.
Many-to-one proxy implementations are upgraded by calling the holder contract
for the implementation ID being upgraded.
One-to-one proxies are upgraded by calling the proxy contract directly.
The owner can lock a one-to-one proxy or many-to-one implementation ID so that
it becomes impossible to upgrade.

# Functions:
- [Access Controls](#access-controls)
  - [`approveDeployer(address deployer)`](#DelegateCallProxyManager-approveDeployer-address-)
  - [`revokeDeployerApproval(address deployer)`](#DelegateCallProxyManager-revokeDeployerApproval-address-)
- [Implementation Management](#implementation-management)
  - [`createManyToOneProxyRelationship(bytes32 implementationID, address implementation)`](#DelegateCallProxyManager-createManyToOneProxyRelationship-bytes32-address-)
  - [`lockImplementationManyToOne(bytes32 implementationID)`](#DelegateCallProxyManager-lockImplementationManyToOne-bytes32-)
  - [`lockImplementationOneToOne(address proxyAddress)`](#DelegateCallProxyManager-lockImplementationOneToOne-address-)
  - [`setImplementationAddressManyToOne(bytes32 implementationID, address implementation)`](#DelegateCallProxyManager-setImplementationAddressManyToOne-bytes32-address-)
  - [`setImplementationAddressOneToOne(address proxyAddress, address implementation)`](#DelegateCallProxyManager-setImplementationAddressOneToOne-address-address-)
- [Proxy Deployment](#proxy-deployment)
  - [`deployProxyOneToOne(bytes32 suppliedSalt, address implementation)`](#DelegateCallProxyManager-deployProxyOneToOne-bytes32-address-)
  - [`deployProxyManyToOne(bytes32 implementationID, bytes32 suppliedSalt)`](#DelegateCallProxyManager-deployProxyManyToOne-bytes32-bytes32-)
- [Queries](#queries)
  - [`isImplementationLocked(bytes32 implementationID)`](#DelegateCallProxyManager-isImplementationLocked-bytes32-)
  - [`isImplementationLocked(address proxyAddress)`](#DelegateCallProxyManager-isImplementationLocked-address-)
  - [`isApprovedDeployer(address deployer)`](#DelegateCallProxyManager-isApprovedDeployer-address-)
  - [`getImplementationHolder()`](#DelegateCallProxyManager-getImplementationHolder--)
  - [`getImplementationHolder(bytes32 implementationID)`](#DelegateCallProxyManager-getImplementationHolder-bytes32-)
  - [`computeProxyAddressOneToOne(address originator, bytes32 suppliedSalt)`](#DelegateCallProxyManager-computeProxyAddressOneToOne-address-bytes32-)
  - [`computeProxyAddressManyToOne(address originator, bytes32 implementationID, bytes32 suppliedSalt)`](#DelegateCallProxyManager-computeProxyAddressManyToOne-address-bytes32-bytes32-)
  - [`computeHolderAddressManyToOne(bytes32 implementationID)`](#DelegateCallProxyManager-computeHolderAddressManyToOne-bytes32-)
- [Internal Functions](#internal-functions)
  - [`_setImplementation(address proxyOrHolder, address implementation)`](#DelegateCallProxyManager-_setImplementation-address-address-)

# Access Controls

## <a id='DelegateCallProxyManager-approveDeployer-address-'></a> `approveDeployer`

```
function approveDeployer(address deployer)
```



Allows `deployer` to deploy many-to-one proxies.


## <a id='DelegateCallProxyManager-revokeDeployerApproval-address-'></a> `revokeDeployerApproval`

```
function revokeDeployerApproval(address deployer)
```



Prevents `deployer` from deploying many-to-one proxies.

# Implementation Management

## <a id='DelegateCallProxyManager-createManyToOneProxyRelationship-bytes32-address-'></a> `createManyToOneProxyRelationship`

```
function createManyToOneProxyRelationship(bytes32 implementationID, address implementation)
```



Creates a many-to-one proxy relationship.
Deploys an implementation holder contract which stores the
implementation address for many proxies. The implementation
address can be updated on the holder to change the runtime
code used by all its proxies.


## Parameters:
- `implementationID`: ID for the implementation, used to identify the
proxies that use it. Also used as the salt in the create2 call when
deploying the implementation holder contract.

- `implementation`: Address with the runtime code the proxies
should use.

## <a id='DelegateCallProxyManager-lockImplementationManyToOne-bytes32-'></a> `lockImplementationManyToOne`

```
function lockImplementationManyToOne(bytes32 implementationID)
```



Lock the current implementation for `proxyAddress` so that it can never be upgraded again.


## <a id='DelegateCallProxyManager-lockImplementationOneToOne-address-'></a> `lockImplementationOneToOne`

```
function lockImplementationOneToOne(address proxyAddress)
```



Lock the current implementation for `proxyAddress` so that it can never be upgraded again.


## <a id='DelegateCallProxyManager-setImplementationAddressManyToOne-bytes32-address-'></a> `setImplementationAddressManyToOne`

```
function setImplementationAddressManyToOne(bytes32 implementationID, address implementation)
```



Updates the implementation address for a many-to-one
proxy relationship.


## Parameters:
- `implementationID`: Identifier for the implementation.

- `implementation`: Address with the runtime code the proxies
should use.

## <a id='DelegateCallProxyManager-setImplementationAddressOneToOne-address-address-'></a> `setImplementationAddressOneToOne`

```
function setImplementationAddressOneToOne(address proxyAddress, address implementation)
```



Updates the implementation address for a one-to-one proxy.
Note: This could work for many-to-one as well if the caller
provides the implementation holder address in place of the
proxy address, as they use the same access control and update
mechanism.


## Parameters:
- `proxyAddress`: Address of the deployed proxy

- `implementation`: Address with the runtime code for
the proxy to use.

# Proxy Deployment

## <a id='DelegateCallProxyManager-deployProxyOneToOne-bytes32-address-'></a> `deployProxyOneToOne`

```
function deployProxyOneToOne(bytes32 suppliedSalt, address implementation) returns (address proxyAddress)
```



Deploy a proxy contract with a one-to-one relationship
with its implementation.
The proxy will have its own implementation address which can
be updated by the proxy manager.


## Parameters:
- `suppliedSalt`: Salt provided by the account requesting deployment.

- `implementation`: Address of the contract with the runtime
code that the proxy should use.

## <a id='DelegateCallProxyManager-deployProxyManyToOne-bytes32-bytes32-'></a> `deployProxyManyToOne`

```
function deployProxyManyToOne(bytes32 implementationID, bytes32 suppliedSalt) returns (address proxyAddress)
```



Deploy a proxy with a many-to-one relationship with its implemenation.
The proxy will call the implementation holder for every transaction to
determine the address to use in calls.


## Parameters:
- `implementationID`: Identifier for the proxy's implementation.

- `suppliedSalt`: Salt provided by the account requesting deployment.

# Queries

## <a id='DelegateCallProxyManager-isImplementationLocked-bytes32-'></a> `isImplementationLocked`

```
function isImplementationLocked(bytes32 implementationID) returns (bool)
```



Returns a boolean stating whether `implementationID` is locked.


## <a id='DelegateCallProxyManager-isImplementationLocked-address-'></a> `isImplementationLocked`

```
function isImplementationLocked(address proxyAddress) returns (bool)
```



Returns a boolean stating whether `proxyAddress` is locked.


## <a id='DelegateCallProxyManager-isApprovedDeployer-address-'></a> `isApprovedDeployer`

```
function isApprovedDeployer(address deployer) returns (bool)
```



Returns a boolean stating whether `deployer` is allowed to deploy many-to-one
proxies.


## <a id='DelegateCallProxyManager-getImplementationHolder--'></a> `getImplementationHolder`

```
function getImplementationHolder() returns (address)
```



Queries the temporary storage value `_implementationHolder`.
This is used in the constructor of the many-to-one proxy contract
so that the create2 address is static (adding constructor arguments
would change the codehash) and the implementation holder can be
stored as a constant.


## <a id='DelegateCallProxyManager-getImplementationHolder-bytes32-'></a> `getImplementationHolder`

```
function getImplementationHolder(bytes32 implementationID) returns (address)
```



Returns the address of the implementation holder contract
for `implementationID`.


## <a id='DelegateCallProxyManager-computeProxyAddressOneToOne-address-bytes32-'></a> `computeProxyAddressOneToOne`

```
function computeProxyAddressOneToOne(address originator, bytes32 suppliedSalt) returns (address)
```



Computes the create2 address for a one-to-one proxy requested
by `originator` using `suppliedSalt`.


## Parameters:
- `originator`: Address of the account requesting deployment.

- `suppliedSalt`: Salt provided by the account requesting deployment.

## <a id='DelegateCallProxyManager-computeProxyAddressManyToOne-address-bytes32-bytes32-'></a> `computeProxyAddressManyToOne`

```
function computeProxyAddressManyToOne(address originator, bytes32 implementationID, bytes32 suppliedSalt) returns (address)
```



Computes the create2 address for a many-to-one proxy for the
implementation `implementationID` requested by `originator` using
`suppliedSalt`.


## Parameters:
- `originator`: Address of the account requesting deployment.

- `implementationID`: The identifier for the contract implementation.

- `suppliedSalt`: Salt provided by the account requesting deployment.

## <a id='DelegateCallProxyManager-computeHolderAddressManyToOne-bytes32-'></a> `computeHolderAddressManyToOne`

```
function computeHolderAddressManyToOne(bytes32 implementationID) returns (address)
```



Computes the create2 address of the implementation holder
for `implementationID`.


## Parameters:
- `implementationID`: The identifier for the contract implementation.

# Internal Functions

## <a id='DelegateCallProxyManager-_setImplementation-address-address-'></a> `_setImplementation`

```
function _setImplementation(address proxyOrHolder, address implementation)
```



Sets the implementation address for a one-to-one proxy or
many-to-one implementation holder. Both use the same access
control and update mechanism, which is the receipt of a call
from the proxy manager with the abi-encoded implementation address
as the only calldata.
Note: Verifies that the implementation address is a contract.


## Parameters:
- `proxyOrHolder`: Address of the one-to-one proxy or
many-to-one implementation holder contract.

- `implementation`: Address of the contract with the runtime
code that the proxy or proxies should use.

