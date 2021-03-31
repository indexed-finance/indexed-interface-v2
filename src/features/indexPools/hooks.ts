import { indexPoolsSelectors } from "./selectors";
import { useCallRegistrar } from "hooks";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { AppState, FormattedIndexPool } from "features";
import type { RegisteredCall } from "helpers";

export const usePool = (poolId: string) =>
  useSelector((state: AppState) =>
    indexPoolsSelectors.selectPool(state, poolId)
  );

export const usePoolTokenIds = (poolId: string) =>
  useSelector((state: AppState) =>
    indexPoolsSelectors.selectPoolTokenIds(state, poolId)
  );

export const usePoolTokenAddresses = (poolId: string) =>
  useSelector((state: AppState) =>
    indexPoolsSelectors.selectPoolTokenAddresses(state, poolId)
  );

export const usePoolUnderlyingTokens = (poolId: string) =>
  useSelector((state: AppState) =>
    indexPoolsSelectors.selectPoolUnderlyingTokens(state, poolId)
  );

export const usePoolToTokens = (pool: FormattedIndexPool) => {
  return useMemo(() => ({ [pool.id]: pool.assets.map(({ id }) => id) }), [
    pool.id,
    pool.assets,
  ]);
};

export const usePoolQuickswapLink = (poolAddress: string) => {
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
  };
  const quickswapToken = poolAddressToQuickswapToken[poolAddress];

  return quickswapToken
    ? `https://info.quickswap.exchange/token/${quickswapToken}`
    : "";
};

export function createPoolDetailCalls(poolAddress: string, tokenIds: string[]) {
  const target = poolAddress;
  const interfaceKind = "IPool_ABI";
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
        function: "retrieveCoingeckoDataForPool",
        args: [poolAddress],
      },
      {
        function: "requestPoolTradesAndSwaps",
        args: [poolAddress],
      },
    ],
  };
}

export function usePoolDetailRegistrar(
  poolAddress: string,
  tokenIds: string[],
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
  const caller = "Pool Detail";
  const { onChainCalls, offChainCalls } = createPoolDetailCalls(
    poolAddress,
    tokenIds
  );

  useCallRegistrar(
    {
      caller,
      onChainCalls,
      offChainCalls,
    },
    actions,
    selectors
  );
}
