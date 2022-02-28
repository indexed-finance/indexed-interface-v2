import { AppState, selectors } from "features";
import { ExternalLink, StakeForm } from "components/atomic";
import { MASTER_CHEF_ADDRESS } from "config";
import {
  abbreviateAddress,
  explorerAddressLink,
  sushiswapAddLiquidityLink,
  sushiswapInfoPairLink,
} from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useMasterChefRegistrar,
  useMasterChefRewardsPerDay,
  useMasterChefTransactionCallbacks,
  usePair,
  usePortfolioData,
} from "hooks";
import { useMasterChefAddress } from "hooks/address-hooks";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SushiswapStakeForm() {
  const masterChefAddress = useMasterChefAddress()
  const { id } = useParams<{ id: string }>();
  const { stake, withdraw, exit, claim } = useMasterChefTransactionCallbacks(
    id
  );
  const rewardsPerDay = useMasterChefRewardsPerDay(id);
  const stakingPool = useSelector((state: AppState) =>
    selectors.selectMasterChefPool(state, id)
  );
  const pair = usePair(stakingPool?.token ?? "");
  const data = usePortfolioData({ onlyOwnedAssets: false });
  const url =
    pair && pair.token0 && pair.token1
      ? sushiswapAddLiquidityLink(pair.token0, pair.token1)
      : sushiswapInfoPairLink(stakingPool?.token ?? "");
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

  useMasterChefRegistrar();
  useBalanceAndApprovalRegistrar(
    masterChefAddress,
    stakingPool ? [stakingPool.token] : []
  );

  return stakingPool && portfolioToken ? (
    <StakeForm
      stakingPool={stakingPool}
      portfolioToken={portfolioToken}
      spender={masterChefAddress}
      onStake={stake}
      onWithdraw={withdraw}
      onExit={exit}
      onClaim={claim}
      poolLink={
        <ExternalLink
          to={explorerAddressLink(masterChefAddress)}
        >
          {abbreviateAddress(masterChefAddress)}
        </ExternalLink>
      }
      stakingTokenLink={
        <ExternalLink to={url}>{portfolioToken.symbol}</ExternalLink>
      }
      rewardsPerDay={rewardsPerDay.toString()}
      rewardsAsset="SUSHI"
      decimals={18} // TODO
      formatAssetText={(amount: string) => `${amount} SUSHI / Day`}
    />
  ) : null;
}
