import { AppState, selectors } from "features";
import { ExternalLink, StakeForm } from "components/atomic";
import { MASTER_CHEF_ADDRESS } from "config";
import { sushiswapAddLiquidityLink, sushiswapInfoPairLink } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useMasterChefRegistrar,
  useMasterChefRewardsPerDay,
  useMasterChefTransactionCallbacks,
  usePair,
} from "hooks";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SushiswapStakeForm() {
  const { id } = useParams<{ id: string }>();
  const { stake, withdraw, exit, claim } = useMasterChefTransactionCallbacks(
    id
  );
  const rewardsPerDay = useMasterChefRewardsPerDay(id);
  const stakingPool = useSelector((state: AppState) =>
    selectors.selectMasterChefPool(state, id)
  );
  const pair = usePair(stakingPool?.token ?? "");
  const url =
    pair && pair.token0 && pair.token1
      ? sushiswapAddLiquidityLink(pair.token0, pair.token1)
      : sushiswapInfoPairLink(stakingPool?.token ?? "");

  useMasterChefRegistrar();
  useBalanceAndApprovalRegistrar(
    MASTER_CHEF_ADDRESS,
    stakingPool ? [stakingPool.token] : []
  );

  return stakingPool ? (
    <StakeForm
      stakingPool={stakingPool}
      spender={MASTER_CHEF_ADDRESS}
      onStake={stake}
      onWithdraw={withdraw}
      onExit={exit}
      onClaim={claim}
      poolLink="https://google.com/"
      stakingTokenLink={
        <ExternalLink to={url}>{stakingPool.token}</ExternalLink>
      }
      rewardsPerDay={rewardsPerDay.toString()}
      decimals={18} // TODO
      formatAssetText={(amount: string) => `${amount} SUSHI / Day`}
    />
  ) : null;
}
