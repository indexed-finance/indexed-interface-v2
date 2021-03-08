import { Interface } from "ethers/lib/utils";

import IERC20_ABI from "./IERC20.json";
import IPoolInitializer_ABI from "./IPoolInitializer.json";
import IPool_ABI from "./IPool.json";
import Pair_ABI from "./Pair.json";
import StakingRewardsFactory_ABI from "./StakingRewardsFactory.json";
import StakingRewards_ABI from "./StakingRewards.json";

export const IERC20 = new Interface(IERC20_ABI);
export const IPool = new Interface(IPool_ABI);
export const IPoolInitializer = new Interface(IPoolInitializer_ABI);
export const Pair = new Interface(Pair_ABI);
export const StakingRewards = new Interface(StakingRewards_ABI);
export const StakingRewardsFactory = new Interface(StakingRewardsFactory_ABI);

export {
  IPool_ABI,
  IERC20_ABI,
  IPoolInitializer_ABI,
  Pair_ABI,
  StakingRewards_ABI,
  StakingRewardsFactory_ABI,
};
