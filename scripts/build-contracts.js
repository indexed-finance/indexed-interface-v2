const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const srcDir = path.join(__dirname, '..', 'src');
const typechainDir = path.join(srcDir, 'ethereum', 'abi', 'types');
const factoriesDir = path.join(typechainDir, 'factories');


//#region Clean up ethereum/abi/types
// Remove factories directory
rimraf.sync(factoriesDir);

// Remove factory exports from index
const indexPath = path.join(typechainDir, 'index.ts');
const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n').filter(line => !line.includes(`from "./factories/`));
fs.writeFileSync(indexPath, indexLines.join('\n'));
//#endregion

const contractNames = indexLines
  .map(line => (/"\.\/([A-Z]\w+)\";/g).exec(line))
  .filter(result => result)
  .map(result => result[1]);

//#region Build ethereum/abi/interfaces
const EthersInterfaceImport = `import { Interface } from "ethers/lib/utils";`;

const TypeChainImports = [
  `import type {`,
  ...contractNames.map(name => `\t${name},`).sort(),
  `} from "./types";`
].join('\n');

const AbiImports = contractNames.map(name => `import ${name}_ABI from "./${name}.json";`).sort().join('\n');

const InterfaceExports = contractNames.map(name => `export const ${name}Interface = new Interface(${name}_ABI) as ${name}["interface"];`).join('\n');

const AbiExports = [
  `export {`,
  ...contractNames.map(name => `\t${name}_ABI,`),
 `}`
].join('\n');

const InterfaceLookupExport = [
  `export const interfaceLookup = {`,
  ...contractNames.map(name => `\t${name}: ${name}Interface,`),
 `}`
].join('\n');

const InterfaceKindExport = `export type InterfaceKind = keyof typeof interfaceLookup;`;

const InterfacesFile = [
  EthersInterfaceImport,
  TypeChainImports,
  AbiImports,
  InterfaceExports,
  AbiExports,
  InterfaceLookupExport,
  InterfaceKindExport
].join('\n\n');

const interfacesPath = path.join(srcDir, 'ethereum', 'abi', 'interfaces.ts')

fs.writeFileSync(interfacesPath, InterfacesFile);
//#endregion

//#region Build ethereum/abi/contracts
const EthersContractImport = `import { Contract } from "@ethersproject/contracts";`;
const ProviderImport = `import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";`;
const InterfaceImport = `import { InterfaceKind, interfaceLookup } from "./interfaces";`

const ContractTypeLookup = [
  `export type ContractTypeLookup = {`,
  ...contractNames.map(name => `\t${name}: ${name},`),
 `}`
].join('\n');

const GetContractFunction =
`export function getContract<K extends InterfaceKind>(
  address: string,
  name: K,
  signerOrProvider: JsonRpcProvider | JsonRpcSigner
): ContractTypeLookup[K] {
  // Cast to any because the return type is more specific than Contract
  return new Contract(address, interfaceLookup[name], signerOrProvider) as any;
}`

const ContractFile = [
  ...[
    EthersContractImport,
    ProviderImport,
    InterfaceImport,
    TypeChainImports,
  ].sort(),
  ContractTypeLookup,
  GetContractFunction
].join('\n\n');

const contractPath = path.join(srcDir, 'ethereum', 'abi', 'contracts.ts')
fs.writeFileSync(contractPath, ContractFile);
//#endregion

//#region Build hooks/contract-hooks
const ContractNameOverrides = {
  IPool: 'IndexPool',
  IERC20: 'Token',
  UniswapV2Router: 'UniswapRouter',
  ERC20DividendsOwned: 'DNDX',
  SharesTimeLock: 'Timelock'
};

const SingletonContracts = {
  MultiCall2: 'MULTICALL2_ADDRESS',
};

const NetworkDependentContracts = {
  MultiTokenStaking: 'MULTI_TOKEN_STAKING_ADDRESS',
  UniswapV2Router: 'UNISWAP_ROUTER_ADDRESS',
  IndexedNarwhalRouter: 'NARWHAL_ROUTER_ADDRESS',
  MasterChef: 'MASTER_CHEF_ADDRESS',
  AdapterRegistry: 'ADAPTER_REGISTRY_ADDRESS',
  ERC20DividendsOwned: 'DNDX_ADDRESS',
  SharesTimeLock: 'DNDX_TIMELOCK_ADDRESS',
}

const ContractsImports = `import { ContractTypeLookup, InterfaceKind, getContract } from "ethereum";`;
const ChainIdImport = `import { useChainId } from "hooks";`;
const SignerImport = `import { useSigner } from "features";`;

const UseContractBaseHook =
`export function useContractWithSigner<T extends InterfaceKind>(address: string | undefined, name: T): ContractTypeLookup[T] | undefined {
  const signer = useSigner();
  if (signer && address) {
    return getContract(address, name, signer);
  }
}`;

const ContractHooks = contractNames.map((name) => {
  const displayName = ContractNameOverrides[name] ?? name;
  const addressName = NetworkDependentContracts[name];
  const address = SingletonContracts[name];
  const useAddressParam = !(address || addressName);
  const arr = [
    [
      `export function use${displayName}Contract(`,
      (useAddressParam ? `address: string` : ''),
      `) {`
    ].join(''),
  ];
  if (addressName) {
    arr.push(`\tconst chainId = useChainId();`, `\tconst address = ${addressName}[chainId];`);
  } else if (address) {
    arr.push(`\tconst address = ${address};`)
  }
  arr.push(`\treturn useContractWithSigner(address, "${name}");`);
  arr.push('}')
  return arr.join('\n');
}).join('\n\n');

const ConstantsImports = [
  `import {`,
  ...[
    ...Object.values(SingletonContracts),
    ...Object.values(NetworkDependentContracts)
  ].sort().map(c => `\t${c},`),
  `} from "config";`
].join('\n');

const ContractHooksFile = [
  ConstantsImports,
  ContractsImports,
  ChainIdImport,
  SignerImport,
  UseContractBaseHook,
  ContractHooks
].join('\n\n');

const contractHooksPath = path.join(srcDir, 'hooks', 'contract-hooks.ts')
fs.writeFileSync(contractHooksPath, ContractHooksFile);
//#endregion

/* const tokens = [
  'NDX_ADDRESS',
  'WETH_ADDRESS',
  'SUSHI_ADDRESS',
  'DAI_ADDRESS',
  'USDC_ADDRESS',
  'DNDX_ADDRESS',
]; */

const NameLookup = Object.entries({
  ...SingletonContracts,
  ...NetworkDependentContracts
}).reduce((prev, [name, addressVar]) => ({
  ...prev,
  [addressVar]: name
}), {
  NDX_ADDRESS: 'Ndx',
  WETH_ADDRESS: 'Weth',
  SUSHI_ADDRESS: 'Sushi',
  DAI_ADDRESS: 'Dai',
  USDC_ADDRESS: 'Usdc',
  DNDX_ADDRESS: 'Dndx',
})

const AddressVars = Object.keys(NameLookup);

const AddressImports = [
  `import {`,
  ...AddressVars.sort().map(t => `\t${t},`),
  `} from "config";`
].join('\n');

const AddressFns = AddressVars.map((addressVar) => {
  const name = NameLookup[addressVar];
  
  return [
    `export function use${name}Address() {`,
    `\tconst chainId = useChainId();`,
    `\treturn useMemo(() => ${addressVar}[chainId]?.toLowerCase(), [chainId]);`,
    `}`
  ].join('\n');
}).join('\n\n');

const AddressHooksFile = [
  AddressImports,
  ChainIdImport,
  AddressFns
].join('\n\n');

const AddressHooksPath = path.join(srcDir, 'hooks', 'address-hooks.ts')
fs.writeFileSync(AddressHooksPath, AddressHooksFile);