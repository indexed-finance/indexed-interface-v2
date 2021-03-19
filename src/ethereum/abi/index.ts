import { Interface } from "ethers/lib/utils";

import IERC20_ABI from "./IERC20.json";
import IPoolInitializer_ABI from "./IPoolInitializer.json";
import IPool_ABI from "./IPool.json";
import IndexedUniswapRouterBurner_ABI from "./IndexedUniswapRouterBurner.json";
import IndexedUniswapRouterMinter_ABI from "./IndexedUniswapRouterMinter.json";
import Pair_ABI from "./Pair.json";
import StakingRewardsFactory_ABI from "./StakingRewardsFactory.json";
import StakingRewards_ABI from "./StakingRewards.json";
import UniswapV2Router_ABI from "./UniswapV2Router.json";

export const IERC20 = new Interface(IERC20_ABI);
export const IPool = new Interface(IPool_ABI);
export const IPoolInitializer = new Interface(IPoolInitializer_ABI);
export const Pair = new Interface(Pair_ABI);
export const StakingRewards = new Interface(StakingRewards_ABI);
export const StakingRewardsFactory = new Interface(StakingRewardsFactory_ABI);
export const UniswapV2Router = new Interface(UniswapV2Router_ABI);
export const IndexedUniswapRouterBurner = new Interface(IndexedUniswapRouterBurner_ABI);
export const IndexedUniswapRouterMinter = new Interface(IndexedUniswapRouterMinter_ABI);

export {
  IPool_ABI,
  IERC20_ABI,
  IPoolInitializer_ABI,
  Pair_ABI,
  StakingRewards_ABI,
  StakingRewardsFactory_ABI,
  UniswapV2Router_ABI,
  IndexedUniswapRouterBurner_ABI,
  IndexedUniswapRouterMinter_ABI
};
