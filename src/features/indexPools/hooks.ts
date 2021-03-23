import { AppState, RegisteredCall, actions, selectors } from "features";
import { useCallRegistrar } from "hooks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

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
  const dispatch = useDispatch();
  const blockNumber = useSelector(selectors.selectBlockNumber);
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

  // Effect:
  // Whenever a new block comes in, reload coingecko data and trades/swaps.
  useEffect(() => {
    if (blockNumber > 0) {
      dispatch(actions.retrieveCoingeckoData(poolAddress));
      dispatch(actions.requestPoolTradesAndSwaps(poolAddress));
    }
  }, [dispatch, poolAddress, blockNumber]);

  useCallRegistrar({
    calls: poolCalls,
  });
}
