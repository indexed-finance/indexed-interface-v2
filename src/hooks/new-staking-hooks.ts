import { AppState, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { NewStakingMeta, NewStakingPool } from "features/newStaking";
import { RegisteredCall, convert } from "helpers";
import {
  StakingTransactionCallbacks,
  useAddTransactionCallback,
} from "./transaction-hooks";
import { useCallRegistrar } from "./use-call-registrar";
import { useCallback, useMemo } from "react";
import { useMultiTokenStakingContract } from "./contract-hooks";
import { useSelector } from "react-redux";
import {
  useTokenPrice,
  useTotalSuppliesWithLoadingIndicator,
} from "./token-hooks";
import { useUniswapPairs } from "./pair-hooks";
import { useUserAddress } from "./user-hooks";

export const useNewStakedBalance = (id: string) =>
  useSelector((state: AppState) =>
    selectors.selectNewUserStakedBalance(state, id)
  );

export const useNewStakingPoolsForTokens = (stakingTokens: string[]) =>
  useSelector((state: AppState) =>
    selectors.selectNewStakingPoolsByStakingTokens(state, stakingTokens)
  );

export const useNewStakingPool = (id: string) =>
  useSelector((state: AppState) => selectors.selectNewStakingPool(state, id));

export function useNewStakingTokenPrice(id: string) {
  const stakingPool = useNewStakingPool(id);
  const [supplyTokens, _pairs, indexPool] = useMemo(() => {
    if (!stakingPool) return [[], [], ""];
    if (!stakingPool.isWethPair) {
      return [[], [], stakingPool.token];
    }
    const [token0, token1] = [
      stakingPool.token0 as string,
      stakingPool.token1 as string,
    ];
    const indexPool = (
      stakingPool.token0?.toLowerCase() === WETH_CONTRACT_ADDRESS
        ? stakingPool.token1
        : stakingPool.token0
    ) as string;
    return [
      [stakingPool.token.toLowerCase()],
      [
        {
          id: stakingPool.token.toLowerCase(),
          token0,
          token1,
          exists: true,
        },
      ],
      indexPool,
    ];
  }, [stakingPool]);
  const [supplies, suppliesLoading] =
    useTotalSuppliesWithLoadingIndicator(supplyTokens);
  const [pairs, pairsLoading] = useUniswapPairs(_pairs);
  const [tokenPrice, tokenPriceLoading] = useTokenPrice(indexPool);
  const hasLoaded = useMemo(() => {
    if (!stakingPool) return false;
    if (stakingPool!.isWethPair) {
      return !(pairsLoading || suppliesLoading || tokenPriceLoading);
    }
    return !tokenPriceLoading;
  }, [stakingPool, pairsLoading, suppliesLoading, tokenPriceLoading]);

  return useMemo(() => {
    if (hasLoaded) {
      if (stakingPool!.isWethPair) {
        const [pair] = pairs || [];
        const [supply] = supplies || [];
        const firstTokenIsStakingPool =
          pair.token0.address.toLowerCase() === indexPool.toLowerCase();
        const tokenReserve = firstTokenIsStakingPool
          ? pair.reserve0
          : pair.reserve1;
        const valueOfSupplyInToken = parseFloat(tokenReserve.toExact()) * 2;
        const tokensPerLpToken =
          valueOfSupplyInToken /
          parseFloat(convert.toBalance(supply, 18, false));
        return tokensPerLpToken * (tokenPrice as number);
      } else {
        return tokenPrice;
      }
    } else {
      return null;
    }
  }, [hasLoaded, pairs, stakingPool, supplies, tokenPrice, indexPool]);
}

export const useNewStakingInfoLookup = (ids: string[]) =>
  useSelector((state: AppState) =>
    selectors.selectNewStakingInfoLookup(state, ids)
  );

export function useNewStakingApy(pid: string) {
  const stakingPool = useNewStakingPool(pid);
  const [ndxPrice] = useTokenPrice(NDX_ADDRESS);
  const tokenPrice = useNewStakingTokenPrice(pid);

  return useMemo(() => {
    const hasLoaded = ndxPrice && tokenPrice && stakingPool;

    if (hasLoaded) {
      const ndxMinedPerDay = convert.toBigNumber(
        stakingPool?.rewardsPerDay ?? "0"
      );
      const valueNdxPerYear = parseFloat(
        convert.toBalance(
          ndxMinedPerDay.times(365).times(ndxPrice ?? 0),
          18,
          false
        )
      );
      const stakedAmount = parseFloat(
        convert.toBalance(stakingPool?.totalStaked ?? "0", 18)
      );
      const totalStakedValue = stakedAmount * (tokenPrice ?? 0);
      return convert.toPercent(valueNdxPerYear / totalStakedValue);
    } else {
      return null;
    }
  }, [tokenPrice, ndxPrice, stakingPool]);
}

export function createNewStakingCalls(
  multiTokenStaking: string,
  pid: string,
  stakingToken: string,
  userAddress?: string
): {
  onChainCalls: RegisteredCall[];
  offChainCalls: RegisteredCall[];
} {
  const onChainCalls: RegisteredCall[] = [
    {
      interfaceKind: "IERC20",
      target: stakingToken,
      function: "balanceOf",
      args: [multiTokenStaking],
    },
  ];

  if (userAddress) {
    onChainCalls.push(
      {
        target: multiTokenStaking,
        function: "userInfo",
        args: [pid, userAddress],
        interfaceKind: "MultiTokenStaking",
      },
      {
        target: multiTokenStaking,
        function: "pendingRewards",
        args: [pid, userAddress],
        interfaceKind: "MultiTokenStaking",
      }
    );
  }

  return {
    onChainCalls,
    offChainCalls: [],
  };
}

export const NEW_STAKING_CALLER = "NewStaking";

const BLOCKS_PER_DAY = 86400 / 13.5;

export function useNewStakingRegistrar() {
  const userAddress = useUserAddress();
  const meta: NewStakingMeta = useSelector(selectors.selectNewStakingMeta);
  const stakingPools: NewStakingPool[] = useSelector(
    selectors.selectAllNewStakingPools
  );
  const firstPool = stakingPools.sort(
    (a, b) => b.lastRewardBlock - a.lastRewardBlock
  )[0];
  const fromBlock = firstPool?.lastRewardBlock;
  const { onChainCalls, offChainCalls } = useMemo(() => {
    if (!fromBlock) return { onChainCalls: [], offChainCalls: [] };
    return stakingPools.reduce(
      (prev, next) => {
        const poolCalls = createNewStakingCalls(
          meta.id,
          next.id,
          next.token,
          userAddress
        );

        prev.onChainCalls.push(...poolCalls.onChainCalls);
        prev.offChainCalls.push(...poolCalls.offChainCalls);

        return prev;
      },
      {
        onChainCalls: [
          {
            target: meta.rewardsSchedule,
            function: "getRewardsForBlockRange",
            interfaceKind: "RewardsSchedule",
            args: [
              fromBlock.toString(),
              Math.floor(fromBlock + BLOCKS_PER_DAY).toString(),
            ],
          },
        ],
        offChainCalls: [],
      } as {
        onChainCalls: RegisteredCall[];
        offChainCalls: RegisteredCall[];
      }
    );
  }, [stakingPools, meta, fromBlock, userAddress]);

  useCallRegistrar({
    caller: NEW_STAKING_CALLER,
    onChainCalls,
    offChainCalls,
  });
}

export function useNewStakingTransactionCallbacks(
  pid: string
): StakingTransactionCallbacks {
  const userAddress = useUserAddress();
  const stakedBalance = useNewStakedBalance(pid);
  const contract = useMultiTokenStakingContract();
  const addTransaction = useAddTransactionCallback();

  const stake = useCallback(
    (amount: string) => {
      // @todo Figure out a better way to handle this
      if (!contract) throw new Error();
      const tx = contract.deposit(pid, amount, userAddress);
      addTransaction(tx);
    },
    [contract, addTransaction, pid, userAddress]
  );

  const withdraw = useCallback(
    (amount: string) => {
      // @todo Figure out a better way to handle this
      if (!contract) throw new Error();
      const tx = contract.withdraw(pid, amount, userAddress);
      addTransaction(tx);
    },
    [contract, addTransaction, pid, userAddress]
  );

  const exit = useCallback(() => {
    // @todo Figure out a better way to handle this
    if (!contract || !stakedBalance) throw new Error();
    const tx = contract.withdrawAndHarvest(pid, stakedBalance, userAddress);
    addTransaction(tx);
  }, [contract, addTransaction, pid, userAddress, stakedBalance]);

  const claim = useCallback(() => {
    // @todo Figure out a better way to handle this
    if (!contract) throw new Error();
    const tx = contract.harvest(pid, userAddress);
    addTransaction(tx);
  }, [contract, addTransaction, pid, userAddress]);

  return {
    stake,
    exit,
    withdraw,
    claim,
  };
}
