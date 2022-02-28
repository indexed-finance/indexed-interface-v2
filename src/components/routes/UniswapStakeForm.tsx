import { AppState, selectors } from "features";
import { ExternalLink, StakeForm } from "components/atomic";
import { Link, useParams } from "react-router-dom";
import { MULTI_TOKEN_STAKING_ADDRESS } from "config";
import { abbreviateAddress, explorerAddressLink } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useNewStakingRegistrar,
  useNewStakingTransactionCallbacks,
  usePortfolioData,
} from "hooks";
import { useMemo } from "react";
import { useMultiTokenStakingAddress } from "hooks/address-hooks";
import { useSelector } from "react-redux";
import S from "string";

export default function UniswapStakeForm() {
  const { id } = useParams<{ id: string }>();
  const stakingAddress = useMultiTokenStakingAddress()
  const { stake, withdraw, exit, claim } = useNewStakingTransactionCallbacks(
    id
  );
  const stakingPool = useSelector((state: AppState) =>
    selectors.selectNewStakingPool(state, id)
  );
  const data = usePortfolioData({ onlyOwnedAssets: false });
  const portfolioToken = useMemo(
    () =>
      stakingPool
        ? data.tokens.find(
            (token) =>
              token.address.toLowerCase() === stakingPool.token.toLowerCase()
          )
        : null,
    [data.tokens, stakingPool]
  );

  useNewStakingRegistrar();
  useBalanceAndApprovalRegistrar(
    stakingAddress,
    stakingPool ? [stakingPool.token] : []
  );

  return stakingPool && portfolioToken ? (
    <StakeForm
      stakingPool={stakingPool}
      portfolioToken={portfolioToken}
      rewardsPerDay={stakingPool?.rewardsPerDay ?? "0.00"}
      rewardsAsset="NDX"
      spender={stakingAddress}
      onStake={stake}
      onWithdraw={withdraw}
      onExit={exit}
      onClaim={claim}
      poolLink={
        <ExternalLink
          to={explorerAddressLink(stakingAddress)}
        >
          {abbreviateAddress(stakingAddress)}
        </ExternalLink>
      }
      stakingTokenLink={
        stakingPool.isWethPair ? (
          <ExternalLink
            to={`https://v2.info.uniswap.org/pair/${portfolioToken.address}`}
          >
            {portfolioToken.symbol}
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
