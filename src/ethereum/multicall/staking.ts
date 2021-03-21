import { Call, MultiCallResults } from "./types";
import { IERC20, StakingRewards, StakingRewardsFactory } from "ethereum/abi";
import { convert } from "helpers";

export function buildStakingUpdateCalls(
  stakingPool: string,
  stakingToken: string,
  userAddress = ""
): Call[] {
  return [
    { interface: StakingRewards, target: stakingPool, function: 'rewardsDuration' },
    { interface: StakingRewards, target: stakingPool, function: 'periodFinish' },
    { interface: StakingRewards, target: stakingPool, function: 'rewardRate' },
    { interface: StakingRewards, target: stakingPool, function: 'rewardPerToken' },
    { interface: StakingRewards, target: stakingPool, function: 'totalSupply' },
    { interface: IERC20, target: stakingToken, function: 'balanceOf', args: [stakingPool] },
    { interface: StakingRewards, target: stakingPool, function: 'balanceOf', args: [userAddress] },
    { interface: StakingRewards, target: stakingPool, function: 'earned', args: [userAddress] },
  ];
}

function formatStakingUpdateResults(
  { blockNumber, results }: MultiCallResults,
  stakingPool: string,
  userAddress: string
) {
  const [
    rewardsDuration,
    periodFinish,
    rewardRate,
    rewardPerToken,
    totalSupply,
    poolBalanceStakingToken,
    userStakedBalance,
    userRewardsEarned
  ] = results.map(([raw]) => raw.toString());
  return {
    id: stakingPool,
    rewardsDuration: +(rewardsDuration),
    periodFinish: +(periodFinish),
    rewardRate,
    rewardPerToken,
    totalSupply,
    poolBalanceStakingToken,
    userData: {
      userAddress,
      userStakedBalance,
      userRewardsEarned
    }
  };
}