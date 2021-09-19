import { Interface } from "ethers/lib/utils";

import type {
	AdapterRegistry,
	ERC20DividendsOwned,
	Erc20Adapter,
	IERC20,
	IIndexedUniswapV2Oracle,
	IPool,
	IPoolInitializer,
	IndexedNarwhalRouter,
	IndexedUniswapRouterBurner,
	IndexedUniswapRouterMinter,
	MasterChef,
	MultiCall2,
	MultiTokenStaking,
	NirnVault,
	Pair,
	RewardsSchedule,
	SharesTimeLock,
	StakingRewards,
	StakingRewardsFactory,
	UniswapV2Router,
} from "./types";

import AdapterRegistry_ABI from "./AdapterRegistry.json";
import ERC20DividendsOwned_ABI from "./ERC20DividendsOwned.json";
import Erc20Adapter_ABI from "./Erc20Adapter.json";
import IERC20_ABI from "./IERC20.json";
import IIndexedUniswapV2Oracle_ABI from "./IIndexedUniswapV2Oracle.json";
import IPoolInitializer_ABI from "./IPoolInitializer.json";
import IPool_ABI from "./IPool.json";
import IndexedNarwhalRouter_ABI from "./IndexedNarwhalRouter.json";
import IndexedUniswapRouterBurner_ABI from "./IndexedUniswapRouterBurner.json";
import IndexedUniswapRouterMinter_ABI from "./IndexedUniswapRouterMinter.json";
import MasterChef_ABI from "./MasterChef.json";
import MultiCall2_ABI from "./MultiCall2.json";
import MultiTokenStaking_ABI from "./MultiTokenStaking.json";
import NirnVault_ABI from "./NirnVault.json";
import Pair_ABI from "./Pair.json";
import RewardsSchedule_ABI from "./RewardsSchedule.json";
import SharesTimeLock_ABI from "./SharesTimeLock.json";
import StakingRewardsFactory_ABI from "./StakingRewardsFactory.json";
import StakingRewards_ABI from "./StakingRewards.json";
import UniswapV2Router_ABI from "./UniswapV2Router.json";

export const AdapterRegistryInterface = new Interface(AdapterRegistry_ABI) as AdapterRegistry["interface"];
export const Erc20AdapterInterface = new Interface(Erc20Adapter_ABI) as Erc20Adapter["interface"];
export const ERC20DividendsOwnedInterface = new Interface(ERC20DividendsOwned_ABI) as ERC20DividendsOwned["interface"];
export const IERC20Interface = new Interface(IERC20_ABI) as IERC20["interface"];
export const IIndexedUniswapV2OracleInterface = new Interface(IIndexedUniswapV2Oracle_ABI) as IIndexedUniswapV2Oracle["interface"];
export const IndexedNarwhalRouterInterface = new Interface(IndexedNarwhalRouter_ABI) as IndexedNarwhalRouter["interface"];
export const IndexedUniswapRouterBurnerInterface = new Interface(IndexedUniswapRouterBurner_ABI) as IndexedUniswapRouterBurner["interface"];
export const IndexedUniswapRouterMinterInterface = new Interface(IndexedUniswapRouterMinter_ABI) as IndexedUniswapRouterMinter["interface"];
export const IPoolInterface = new Interface(IPool_ABI) as IPool["interface"];
export const IPoolInitializerInterface = new Interface(IPoolInitializer_ABI) as IPoolInitializer["interface"];
export const MasterChefInterface = new Interface(MasterChef_ABI) as MasterChef["interface"];
export const MultiCall2Interface = new Interface(MultiCall2_ABI) as MultiCall2["interface"];
export const MultiTokenStakingInterface = new Interface(MultiTokenStaking_ABI) as MultiTokenStaking["interface"];
export const NirnVaultInterface = new Interface(NirnVault_ABI) as NirnVault["interface"];
export const PairInterface = new Interface(Pair_ABI) as Pair["interface"];
export const RewardsScheduleInterface = new Interface(RewardsSchedule_ABI) as RewardsSchedule["interface"];
export const SharesTimeLockInterface = new Interface(SharesTimeLock_ABI) as SharesTimeLock["interface"];
export const StakingRewardsInterface = new Interface(StakingRewards_ABI) as StakingRewards["interface"];
export const StakingRewardsFactoryInterface = new Interface(StakingRewardsFactory_ABI) as StakingRewardsFactory["interface"];
export const UniswapV2RouterInterface = new Interface(UniswapV2Router_ABI) as UniswapV2Router["interface"];

export {
	AdapterRegistry_ABI,
	Erc20Adapter_ABI,
	ERC20DividendsOwned_ABI,
	IERC20_ABI,
	IIndexedUniswapV2Oracle_ABI,
	IndexedNarwhalRouter_ABI,
	IndexedUniswapRouterBurner_ABI,
	IndexedUniswapRouterMinter_ABI,
	IPool_ABI,
	IPoolInitializer_ABI,
	MasterChef_ABI,
	MultiCall2_ABI,
	MultiTokenStaking_ABI,
	NirnVault_ABI,
	Pair_ABI,
	RewardsSchedule_ABI,
	SharesTimeLock_ABI,
	StakingRewards_ABI,
	StakingRewardsFactory_ABI,
	UniswapV2Router_ABI,
}

export const interfaceLookup = {
	AdapterRegistry: AdapterRegistryInterface,
	Erc20Adapter: Erc20AdapterInterface,
	ERC20DividendsOwned: ERC20DividendsOwnedInterface,
	IERC20: IERC20Interface,
	IIndexedUniswapV2Oracle: IIndexedUniswapV2OracleInterface,
	IndexedNarwhalRouter: IndexedNarwhalRouterInterface,
	IndexedUniswapRouterBurner: IndexedUniswapRouterBurnerInterface,
	IndexedUniswapRouterMinter: IndexedUniswapRouterMinterInterface,
	IPool: IPoolInterface,
	IPoolInitializer: IPoolInitializerInterface,
	MasterChef: MasterChefInterface,
	MultiCall2: MultiCall2Interface,
	MultiTokenStaking: MultiTokenStakingInterface,
	NirnVault: NirnVaultInterface,
	Pair: PairInterface,
	RewardsSchedule: RewardsScheduleInterface,
	SharesTimeLock: SharesTimeLockInterface,
	StakingRewards: StakingRewardsInterface,
	StakingRewardsFactory: StakingRewardsFactoryInterface,
	UniswapV2Router: UniswapV2RouterInterface,
}

export type InterfaceKind = keyof typeof interfaceLookup;