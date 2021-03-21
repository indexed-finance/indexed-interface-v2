import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import selectors from "./selectors";
import type { AppState, RegisteredCall } from "features";

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

export function usePoolDetailRegistrar(
  poolAddress: string,
  tokenIds: string[]
) {
  const caller = "Pool Detail";
  const target = poolAddress;
  const interfaceKind = "IPool_ABI";
  const tokenCalls = tokenIds.reduce((prev, next) => {
    prev.push(
      {
        caller,
        interfaceKind,
        target,
        function: "getBalance",
        args: [next],
      },
      {
        caller,
        interfaceKind,
        target,
        function: "getMinimumBalance",
        args: [next],
      },
      {
        caller,
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
      caller,
      interfaceKind,
      target,
      function: "getTotalDenormalizedWeight",
    },
    {
      caller,
      interfaceKind,
      target,
      function: "totalSupply",
    },
    {
      caller,
      interfaceKind,
      target,
      function: "getSwapFee",
    },
    ...tokenCalls,
  ];

  useCallRegistrar({
    calls: poolCalls,
  });
}
