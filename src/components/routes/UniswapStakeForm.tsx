import { AppState, selectors } from "features";
import { ExternalLink, StakeForm } from "components/atomic";
import { Link, useParams } from "react-router-dom";
import { MULTI_TOKEN_STAKING_ADDRESS } from "config";
import {
  useBalanceAndApprovalRegistrar,
  useNewStakingRegistrar,
  useNewStakingTransactionCallbacks,
} from "hooks";
import { useSelector } from "react-redux";
import S from "string";

export default function UniswapStakeForm() {
  const { id } = useParams<{ id: string }>();
  const { stake, withdraw, exit, claim } = useNewStakingTransactionCallbacks(
    id
  );
  const stakingPool = useSelector((state: AppState) =>
    selectors.selectNewStakingPool(state, id)
  );

  useNewStakingRegistrar();
  useBalanceAndApprovalRegistrar(
    MULTI_TOKEN_STAKING_ADDRESS,
    stakingPool ? [stakingPool.token] : []
  );

  return stakingPool ? (
    <StakeForm
      stakingPool={stakingPool}
      rewardsPerDay={stakingPool?.rewardsPerDay ?? "0.00"}
      spender={MULTI_TOKEN_STAKING_ADDRESS}
      onStake={stake}
      onWithdraw={withdraw}
      onExit={exit}
      onClaim={claim}
      poolLink="https://google.com/"
      stakingTokenLink={
        stakingPool.isWethPair ? (
          <ExternalLink
            to={`https://v2.info.uniswap.org/pair/${stakingPool.token}`}
          >
            {stakingPool.token}
          </ExternalLink>
        ) : (
          <Link to={`/index-pools/${S(stakingPool.name).slugify().s}`}>
            {stakingPool.symbol}
          </Link>
        )
      }
      decimals={stakingPool?.decimals ?? 18}
      formatAssetText={(amount: string) => `${amount} NDX / Day`}
    />
  ) : null;
}
