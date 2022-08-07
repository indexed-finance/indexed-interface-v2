import { AppState, FormattedIndexPool, POOL_CALLER, selectors } from "features";
import { useCachedValue } from "./use-debounce";
import { useCallRegistrar } from "./use-call-registrar";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RegisteredCall } from "helpers";

export const useAllPoolIds = () => useSelector(selectors.selectAllPoolIds);

export const useAllPools = () => useSelector(selectors.selectAllPools);

export const usePool = (poolId: string) =>
  useSelector((state: AppState) => selectors.selectPool(state, poolId));

export const usePoolSymbol = (poolId: string) => usePool(poolId)?.symbol;

export const usePoolTokenIds = (poolId: string) =>
  useSelector((state: AppState) => selectors.selectPoolTokenIds(state, poolId));

export const usePoolTokenAddresses = (poolId: string) =>
  useSelector((state: AppState) =>
    selectors.selectPoolTokenAddresses(state, poolId)
  );

export const usePoolUnderlyingTokens = (poolId: string) =>
  useSelector((state: AppState) =>
    selectors.selectPoolUnderlyingTokens(state, poolId)
  );

export const usePoolToTokens = (pool: FormattedIndexPool) => {
  return useMemo(
    () => ({ [pool.id]: pool.assets.map(({ id }) => id) }),
    [pool.id, pool.assets]
  );
};

export const useFormattedIndexPool = (pool?: string) => useSelector((state: AppState) => pool ? selectors.selectFormattedIndexPool(state, pool) : null)

export const getPoolQuickswapLink = (poolAddress: string) => {
  const poolAddressToQuickswapToken: Record<string, string> = {
    // CC10
    "0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3":
    "0x9c49ba0212bb5db371e66b59d1565b7c06e4894e",
    // DEFI5
    "0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41":
    "0x42435f467d33e5c4146a4e8893976ef12bbce762",
    // DEGEN
    "0x126c121f99e1e211df2e5f8de2d96fa36647c855":
      "0x8a2870fb69a90000d6439b7adfb01d4ba383a415",
    // FFF
    "0xabafa52d3d5a2c18a4c1ae24480d22b831fc0413":
      "0x9aceb6f749396d1930abc9e263efc449e5e82c13",
  };
  const quickswapToken = poolAddressToQuickswapToken[poolAddress];

  return quickswapToken
    ? `https://quickswap.exchange/#/swap?outputCurrency=${quickswapToken}`
    : "";
};

export function createPoolDetailCalls(poolAddress: string, tokenIds: string[]) {
  const target = poolAddress;
  const interfaceKind = "IPool";
  const tokenCalls = tokenIds.reduce((prev, next) => {
    prev.push(
      {
        interfaceKind,
        target,
        function: "getBalance",
        args: [next],
      },
      {
        interfaceKind,
        target,
        function: "getMinimumBalance",
        args: [next],
      },
      {
        interfaceKind,
        target,
        function: "getDenormalizedWeight",
        args: [next],
      }
    );

    return prev;
  }, [] as RegisteredCall[]);
  const poolCalls: RegisteredCall[] = [
    {
      interfaceKind,
      target,
      function: "getTotalDenormalizedWeight",
    },
    {
      interfaceKind,
      target,
      function: "totalSupply",
    },
    {
      interfaceKind,
      target,
      function: "getSwapFee",
    },
    ...tokenCalls,
  ];

  return {
    onChainCalls: poolCalls,
    offChainCalls: [
      {
        target: "",
        function: "fetchTokenPriceData",
        args: [poolAddress, ...tokenIds],
        canBeMerged: true,
      },
      {
        target: "",
        function: "fetchIndexPoolTransactions",
        args: [poolAddress],
        canBeMerged: true,
      },
      {
        target: "",
        function: "fetchIndexPoolUpdates",
        args: [poolAddress],
        canBeMerged: true,
      },
    ],
  };
}

export function usePoolDetailRegistrar(
  poolAddress: string,
  tokenIds: string[]
) {
  const cachedIds = useCachedValue(tokenIds);
  const caller = POOL_CALLER;
  const { onChainCalls, offChainCalls } = useMemo(
    () =>
      poolAddress
        ? createPoolDetailCalls(poolAddress, cachedIds)
        : {
            onChainCalls: [],
            offChainCalls: [],
          },
    [poolAddress, cachedIds]
  );

  useCallRegistrar({
    caller,
    onChainCalls,
    offChainCalls,
  });
}
