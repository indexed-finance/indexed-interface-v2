import {
  ADAPTER_REGISTRY_ADDRESS,
  DAI_ADDRESS,
  DNDX_ADDRESS,
  DNDX_TIMELOCK_ADDRESS,
  MULTICALL2_ADDRESS,
  NARWHAL_ROUTER_ADDRESS,
  NDX_ADDRESS,
  SUSHI_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
  USDC_ADDRESS,
  WETH_ADDRESS,
} from "config";

import { useChainId } from "./settings-hooks";

export function useAdapterRegistryAddress() {
  const chainId = useChainId();
  return ADAPTER_REGISTRY_ADDRESS[chainId];
}

export function useDaiAddress() {
  const chainId = useChainId();
  return DAI_ADDRESS[chainId];
}

export function useERC20DividendsOwnedAddress() {
  const chainId = useChainId();
  return DNDX_ADDRESS[chainId];
}

export function useSharesTimeLockAddress() {
  const chainId = useChainId();
  return DNDX_TIMELOCK_ADDRESS[chainId];
}

export function useMultiCall2Address() {
  const chainId = useChainId();
  return MULTICALL2_ADDRESS[chainId];
}

export function useIndexedNarwhalRouterAddress() {
  const chainId = useChainId();
  return NARWHAL_ROUTER_ADDRESS[chainId];
}

export function useNdxAddress() {
  const chainId = useChainId();
  return NDX_ADDRESS[chainId];
}

export function useSushiAddress() {
  const chainId = useChainId();
  return SUSHI_ADDRESS[chainId];
}

export function useUniswapV2RouterAddress() {
  const chainId = useChainId();
  return UNISWAP_ROUTER_ADDRESS[chainId];
}

export function useUsdcAddress() {
  const chainId = useChainId();
  return USDC_ADDRESS[chainId];
}

export function useWethAddress() {
  const chainId = useChainId();
  return WETH_ADDRESS[chainId];
}
