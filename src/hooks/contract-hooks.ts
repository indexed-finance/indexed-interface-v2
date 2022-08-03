import {
  ADAPTER_REGISTRY_ADDRESS,
  DNDX_ADDRESS,
  DNDX_TIMELOCK_ADDRESS,
  MULTICALL2_ADDRESS,
  NARWHAL_ROUTER_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
} from "config";

import { ContractTypeLookup, InterfaceKind, getContract } from "ethereum";

import { useChainId } from "./settings-hooks";

import { useSigner } from "features";

export function useContractWithSigner<T extends InterfaceKind>(
  address: string | undefined,
  name: T
): ContractTypeLookup[T] | undefined {
  const signer = useSigner();
  if (signer && address) {
    return getContract(address, name, signer);
  }
}

export function useAdapterRegistryContract() {
  const chainId = useChainId();
  const address = ADAPTER_REGISTRY_ADDRESS[chainId];
  return useContractWithSigner(address, "AdapterRegistry");
}

export function useErc20AdapterContract(address: string) {
  return useContractWithSigner(address, "Erc20Adapter");
}

export function useDNDXContract() {
  const chainId = useChainId();
  const address = DNDX_ADDRESS[chainId];
  return useContractWithSigner(address, "ERC20DividendsOwned");
}

export function useTokenContract(address: string) {
  return useContractWithSigner(address, "IERC20");
}

export function useIIndexedUniswapV2OracleContract(address: string) {
  return useContractWithSigner(address, "IIndexedUniswapV2Oracle");
}

export function useIndexedNarwhalRouterContract() {
  const chainId = useChainId();
  const address = NARWHAL_ROUTER_ADDRESS[chainId];
  return useContractWithSigner(address, "IndexedNarwhalRouter");
}

export function useIndexedUniswapRouterBurnerContract(address: string) {
  return useContractWithSigner(address, "IndexedUniswapRouterBurner");
}

export function useIndexedUniswapRouterMinterContract(address: string) {
  return useContractWithSigner(address, "IndexedUniswapRouterMinter");
}

export function useIndexPoolContract(address: string) {
  return useContractWithSigner(address, "IPool");
}

export function useIPoolInitializerContract(address: string) {
  return useContractWithSigner(address, "IPoolInitializer");
}

export function useMultiCall2Contract() {
  const address = MULTICALL2_ADDRESS;
  return useContractWithSigner(address, "MultiCall2");
}

export function usePairContract(address: string) {
  return useContractWithSigner(address, "Pair");
}

export function useRewardsScheduleContract(address: string) {
  return useContractWithSigner(address, "RewardsSchedule");
}

export function useTimelockContract() {
  const chainId = useChainId();
  const address = DNDX_TIMELOCK_ADDRESS[chainId];
  return useContractWithSigner(address, "SharesTimeLock");
}

export function useUniswapRouterContract() {
  const chainId = useChainId();
  const address = UNISWAP_ROUTER_ADDRESS[chainId];
  return useContractWithSigner(address, "UniswapV2Router");
}
