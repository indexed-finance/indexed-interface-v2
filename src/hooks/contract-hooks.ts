import {
	ADAPTER_REGISTRY_ADDRESS,
	BURN_ROUTER_ADDRESS,
	DNDX_ADDRESS,
	DNDX_TIMELOCK_ADDRESS,
	MASTER_CHEF_ADDRESS,
	MINT_ROUTER_ADDRESS,
	MULTICALL2_ADDRESS,
	MULTI_TOKEN_STAKING_ADDRESS,
	NARWHAL_ROUTER_ADDRESS,
	UNISWAP_ROUTER_ADDRESS,
} from "config";

import { ContractTypeLookup, InterfaceKind, getContract } from "ethereum";

import { useSigner } from "features";

export function useContractWithSigner<T extends InterfaceKind>(address: string, name: T): ContractTypeLookup[T] | undefined {
  const signer = useSigner();
  if (signer && address) {
    return getContract(address, name, signer);
  }
}

export function useAdapterRegistryContract() {
	return useContractWithSigner(ADAPTER_REGISTRY_ADDRESS, "AdapterRegistry");
}

export function useErc20AdapterContract(address: string) {
	return useContractWithSigner(address, "Erc20Adapter");
}

export function useDNDXContract() {
	return useContractWithSigner(DNDX_ADDRESS, "ERC20DividendsOwned");
}

export function useTokenContract(address: string) {
	return useContractWithSigner(address, "IERC20");
}

export function useIIndexedUniswapV2OracleContract(address: string) {
	return useContractWithSigner(address, "IIndexedUniswapV2Oracle");
}

export function useIndexedNarwhalRouterContract() {
	return useContractWithSigner(NARWHAL_ROUTER_ADDRESS, "IndexedNarwhalRouter");
}

export function useBurnRouterContract() {
	return useContractWithSigner(BURN_ROUTER_ADDRESS, "IndexedUniswapRouterBurner");
}

export function useMintRouterContract() {
	return useContractWithSigner(MINT_ROUTER_ADDRESS, "IndexedUniswapRouterMinter");
}

export function useIndexPoolContract(address: string) {
	return useContractWithSigner(address, "IPool");
}

export function useIPoolInitializerContract(address: string) {
	return useContractWithSigner(address, "IPoolInitializer");
}

export function useMasterChefContract() {
	return useContractWithSigner(MASTER_CHEF_ADDRESS, "MasterChef");
}

export function useMultiCall2Contract() {
	return useContractWithSigner(MULTICALL2_ADDRESS, "MultiCall2");
}

export function useMultiTokenStakingContract() {
	return useContractWithSigner(MULTI_TOKEN_STAKING_ADDRESS, "MultiTokenStaking");
}

export function useNirnVaultContract(address: string) {
	return useContractWithSigner(address, "NirnVault");
}

export function usePairContract(address: string) {
	return useContractWithSigner(address, "Pair");
}

export function useRewardsScheduleContract(address: string) {
	return useContractWithSigner(address, "RewardsSchedule");
}

export function useSharesTimeLockContract() {
	return useContractWithSigner(DNDX_TIMELOCK_ADDRESS, "SharesTimeLock");
}

export function useStakingRewardsContract(address: string) {
	return useContractWithSigner(address, "StakingRewards");
}

export function useStakingRewardsFactoryContract(address: string) {
	return useContractWithSigner(address, "StakingRewardsFactory");
}

export function useUniswapRouterContract() {
	return useContractWithSigner(UNISWAP_ROUTER_ADDRESS, "UniswapV2Router");
}