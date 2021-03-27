import { useSelector } from "react-redux";
import selectors from "./selectors";
import useCallRegistrar from "hooks/use-call-registrar";
import type { AppState } from "features";
import type { RegisteredCall } from "helpers";

export const usePool = (poolId: string) =>
  useSelector((state: AppState) => selectors.selectPool(state, poolId));

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
        function: "retrieveCoingeckoData",
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
