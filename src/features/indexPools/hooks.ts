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
  const target = poolAddress;
  const tokenCalls = tokenIds.reduce((prev, next) => {
    prev.push(
      {
        target,
        function: "getBalance",
        args: [next],
      },
      {
        target,
        function: "getMinimumBalance",
        args: [next],
      },
      {
        target,
        function: "getDenormalizedWeight",
        args: [next],
      }
    );

    return prev;
  }, [] as RegisteredCall[]);
  const poolCalls = [
    {
      target,
      function: "getTotalDenormalizedWeight",
    },
    {
      target,
      function: "totalSupply",
    },
    {
      target,
      function: "getSwapFee",
    },
    ...tokenCalls,
  ];

  useCallRegistrar({
    calls: poolCalls,
  });
}
