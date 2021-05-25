import { BURN_ROUTER_ADDRESS, MINT_ROUTER_ADDRESS, MULTI_TOKEN_STAKING_ADDRESS, UNISWAP_ROUTER_ADDRESS } from "config";
import { Contract } from "@ethersproject/contracts";
import { IERC20, IPool, IndexedUniswapRouterBurner, IndexedUniswapRouterMinter, MultiTokenStaking, StakingRewards, UniswapV2Router } from "ethereum";
import { Interface, JsonFragment } from "@ethersproject/abi";
import { useSigner } from "features";

export function useContractWithSigner(address: string, abi: Interface | JsonFragment[]): Contract | undefined {
  const signer = useSigner();
  if (signer && address) {
    return new Contract(address, abi, signer);
  }
}

export function useTokenContract(address: string) {
  return useContractWithSigner(address, IERC20);
}

export function useUniswapRouterContract() {
  return useContractWithSigner(UNISWAP_ROUTER_ADDRESS, UniswapV2Router);
}

export function useIndexPoolContract(address: string) {
  return useContractWithSigner(address, IPool);
}

export function useBurnRouterContract() {
  return useContractWithSigner(BURN_ROUTER_ADDRESS, IndexedUniswapRouterBurner);
}

export function useMintRouterContract() {
  return useContractWithSigner(MINT_ROUTER_ADDRESS, IndexedUniswapRouterMinter);
}

export function useStakingRewardsContract(address: string) {
  return useContractWithSigner(address, StakingRewards);
}

export function useMultiTokenStakingContract() {
  return useContractWithSigner(MULTI_TOKEN_STAKING_ADDRESS, MultiTokenStaking);
}