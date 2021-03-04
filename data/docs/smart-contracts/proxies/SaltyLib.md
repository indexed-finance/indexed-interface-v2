## `SaltyLib`



Library for computing create2 salts and addresses for proxies
deployed by `DelegateCallProxyManager`.
Because the proxy factory is meant to be used by multiple contracts,
we use a salt derivation pattern that includes the address of the
contract that requested the proxy deployment, a salt provided by that
contract and the implementation ID used (for many-to-one proxies only).

# Functions:
- [`deriveManyToOneSalt(address originator, bytes32 implementationID, bytes32 suppliedSalt)`](#SaltyLib-deriveManyToOneSalt-address-bytes32-bytes32-)
- [`deriveOneToOneSalt(address originator, bytes32 suppliedSalt)`](#SaltyLib-deriveOneToOneSalt-address-bytes32-)
- [`computeProxyAddressOneToOne(address deployer, address originator, bytes32 suppliedSalt)`](#SaltyLib-computeProxyAddressOneToOne-address-address-bytes32-)
- [`computeProxyAddressManyToOne(address deployer, address originator, bytes32 implementationID, bytes32 suppliedSalt)`](#SaltyLib-computeProxyAddressManyToOne-address-address-bytes32-bytes32-)
- [`computeHolderAddressManyToOne(address deployer, bytes32 implementationID)`](#SaltyLib-computeHolderAddressManyToOne-address-bytes32-)

## <a id='SaltyLib-deriveManyToOneSalt-address-bytes32-bytes32-'></a> `deriveManyToOneSalt`

```
function deriveManyToOneSalt(address originator, bytes32 implementationID, bytes32 suppliedSalt) returns (bytes32)
```



Derives the create2 salt for a many-to-one proxy.
Many different contracts in the Indexed framework may use the
same implementation contract, and they all use the same init
code, so we derive the actual create2 salt from a combination
of the implementation ID, the address of the account requesting
deployment and the user-supplied salt.


## Parameters:
- `originator`: Address of the account requesting deployment.

- `implementationID`: The identifier for the contract implementation.

- `suppliedSalt`: Salt provided by the account requesting deployment.

## <a id='SaltyLib-deriveOneToOneSalt-address-bytes32-'></a> `deriveOneToOneSalt`

```
function deriveOneToOneSalt(address originator, bytes32 suppliedSalt) returns (bytes32)
```



Derives the create2 salt for a one-to-one proxy.


## Parameters:
- `originator`: Address of the account requesting deployment.

- `suppliedSalt`: Salt provided by the account requesting deployment.

## <a id='SaltyLib-computeProxyAddressOneToOne-address-address-bytes32-'></a> `computeProxyAddressOneToOne`

```
function computeProxyAddressOneToOne(address deployer, address originator, bytes32 suppliedSalt) returns (address)
```



Computes the create2 address for a one-to-one proxy deployed
by `deployer` (the factory) when requested by `originator` using
`suppliedSalt`.


## Parameters:
- `deployer`: Address of the proxy factory.

- `originator`: Address of the account requesting deployment.

- `suppliedSalt`: Salt provided by the account requesting deployment.

## <a id='SaltyLib-computeProxyAddressManyToOne-address-address-bytes32-bytes32-'></a> `computeProxyAddressManyToOne`

```
function computeProxyAddressManyToOne(address deployer, address originator, bytes32 implementationID, bytes32 suppliedSalt) returns (address)
```



Computes the create2 address for a many-to-one proxy for the
implementation `implementationID` deployed by `deployer` (the factory)
when requested by `originator` using `suppliedSalt`.


## Parameters:
- `deployer`: Address of the proxy factory.

- `originator`: Address of the account requesting deployment.

- `implementationID`: The identifier for the contract implementation.

- `suppliedSalt`: Salt provided by the account requesting deployment.

## <a id='SaltyLib-computeHolderAddressManyToOne-address-bytes32-'></a> `computeHolderAddressManyToOne`

```
function computeHolderAddressManyToOne(address deployer, bytes32 implementationID) returns (address)
```



Computes the create2 address of the implementation holder
for `implementationID`.


## Parameters:
- `deployer`: Address of the proxy factory.

- `implementationID`: The identifier for the contract implementation.

