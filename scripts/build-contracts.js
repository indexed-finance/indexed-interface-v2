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
  IndexedUniswapRouterBurner: 'BurnRouter',
  IndexedUniswapRouterMinter: 'MintRouter',
  UniswapV2Router: 'UniswapRouter',
  ERC20DividendsOwned: 'DNDX'
};

const SingletonContracts = {
  MultiTokenStaking: 'MULTI_TOKEN_STAKING_ADDRESS',
  IndexedUniswapRouterMinter: 'MINT_ROUTER_ADDRESS',
  IndexedUniswapRouterBurner: 'BURN_ROUTER_ADDRESS',
  UniswapV2Router: 'UNISWAP_ROUTER_ADDRESS',
  MultiCall2: 'MULTICALL2_ADDRESS',
  IndexedNarwhalRouter: 'NARWHAL_ROUTER_ADDRESS',
  MasterChef: 'MASTER_CHEF_ADDRESS',
  AdapterRegistry: 'ADAPTER_REGISTRY_ADDRESS',
  ERC20DividendsOwned: 'DNDX_ADDRESS',
  SharesTimeLock: 'DNDX_TIMELOCK_ADDRESS'
};

const ConstantsImports = [
  `import {`,
  ...Object.values(SingletonContracts).sort().map(c => `\t${c},`),
  `} from "config";`
].join('\n');

const ContractsImports = `import { ContractTypeLookup, InterfaceKind, getContract } from "ethereum";`;
const SignerImport = `import { useSigner } from "features";`;

const UseContractBaseHook =
`export function useContractWithSigner<T extends InterfaceKind>(address: string, name: T): ContractTypeLookup[T] | undefined {
  const signer = useSigner();
  if (signer && address) {
    return getContract(address, name, signer);
  }
}`;

const ContractHooks = contractNames.map((name) => {
  const displayName = ContractNameOverrides[name] ?? name;
  const address = SingletonContracts[name];
  return [
    [
      `export function use${displayName}Contract(`,
      (address ? '' : `address: string`),
      `) {`
    ].join(''),
    `\treturn useContractWithSigner(${address ? address : `address`}, "${name}");`,
    '}'
  ].join('\n');
}).join('\n\n');

const ContractHooksFile = [
  ConstantsImports,
  ContractsImports,
  SignerImport,
  UseContractBaseHook,
  ContractHooks
].join('\n\n');

const contractHooksPath = path.join(srcDir, 'hooks', 'contract-hooks.ts')
fs.writeFileSync(contractHooksPath, ContractHooksFile);
//#endregion