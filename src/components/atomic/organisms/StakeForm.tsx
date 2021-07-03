import {
  Alert,
  Button,
  Col,
  Descriptions,
  Divider,
  Row,
  Space,
  Statistic,
} from "antd";
import {
  AppState,
  ApprovalStatus,
  FormattedPortfolioAsset,
  MasterChefPool,
  NewStakingPool,
  selectors,
} from "features";
import { BigNumber } from "ethereum";
import { ExternalLink, Page, TokenSelector } from "components/atomic";
import { Formik, useFormikContext } from "formik";
import { Link, useParams } from "react-router-dom";
import { MASTER_CHEF_ADDRESS, MULTI_TOKEN_STAKING_ADDRESS } from "config";
import { ReactNode, useMemo } from "react";
import { abbreviateAddress, convert } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useBreakpoints,
  useMasterChefRegistrar,
  useMasterChefRewardsPerDay,
  useMasterChefTransactionCallbacks,
  useNewStakingRegistrar,
  useNewStakingTransactionCallbacks,
  usePortfolioData,
  useTokenApproval,
  useTokenBalance,
} from "hooks";
import { useSelector } from "react-redux";
import S from "string";

function StakingForm({
  token,
  stakingToken,
  protocol,
  spender,
  onStake,
  onWithdraw,
}: {
  token: FormattedPortfolioAsset;
  stakingToken: NewStakingPool | MasterChefPool;
  protocol: "uniswap" | "sushiswap";
  spender: string;
  onStake(amount: string): void;
  onWithdraw(amount: string): void;
}) {
  const isSushiswap = protocol === "sushiswap";
  const { setFieldValue, values, errors } = useFormikContext<{
    amount: {
      displayed: string;
      exact: BigNumber;
    };
    inputType: "stake" | "unstake";
  }>();
  const [staked] = useMemo(() => {
    const staked = stakingToken.userStakedBalance;
    const earned = stakingToken.userEarnedRewards;

    return [staked, earned];
  }, [stakingToken]);
  const sushiRewardsPerDay = useMasterChefRewardsPerDay(stakingToken.id);
  const rewardsPerDayToUse = isSushiswap
    ? sushiRewardsPerDay
    : (stakingToken as NewStakingPool).rewardsPerDay;
  const [estimatedReward, weight] = useMemo<[string, BigNumber]>(() => {
    const stakedAmount = convert.toBigNumber(staked ?? "0");
    const addAmount =
      values.inputType === "stake"
        ? values.amount.exact
        : values.amount.exact.negated();
    const userNewStaked = stakedAmount.plus(addAmount);

    if (userNewStaked.isLessThan(0)) {
      return ["0.00", convert.toBigNumber("0.00")];
    }

    const totalStaked = convert.toBigNumber(stakingToken.totalStaked);
    const newTotalStaked = totalStaked.plus(addAmount);
    const weight = userNewStaked.dividedBy(newTotalStaked);
    const dailyRewardsTotal = convert.toBalanceNumber(rewardsPerDayToUse);
    const result = weight.multipliedBy(dailyRewardsTotal);

    return [convert.toComma(result.toNumber()), weight];
  }, [
    values.amount,
    stakingToken,
    staked,
    values.inputType,
    rewardsPerDayToUse,
  ]);
  const handleSubmit = () => {
    (values.inputType === "stake" ? onStake : onWithdraw)(
      convert.toToken(values.amount.exact, token.decimals).toString()
    );
  };
  const balance = useTokenBalance(stakingToken.token);
  const { status, approve } = useTokenApproval({
    spender,
    tokenId: stakingToken.token,
    amount: values.amount.displayed,
    rawAmount: values.amount.exact.toString(),
    symbol: isSushiswap
      ? token.symbol
      : (stakingToken as NewStakingPool).symbol,
  });
  const estimatedRewardAssetText = `${estimatedReward} ${
    isSushiswap ? "SUSHI / Day" : "NDX / Day"
  }`;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <TokenSelector
        assets={[]}
        value={{
          token: token.symbol,
          amount: values.amount,
        }}
        isInput
        autoFocus
        balanceLabel={values.inputType === "unstake" ? "Staked" : undefined}
        balanceOverride={
          values.inputType === "unstake"
            ? {
                displayed:
                  convert.toBalance(
                    convert.toBigNumber(staked ?? "0"),
                    token.decimals
                  ) ?? "0.00",
                exact: convert.toBigNumber(staked ?? "0"),
              }
            : {
                displayed: convert.toBalance(balance, token.decimals) ?? "0.00",
                exact: convert.toBigNumber(balance ?? "0"),
              }
        }
        selectable={false}
        onChange={(value) => setFieldValue("amount", value.amount)}
        error={errors.amount?.displayed}
      />

      <Alert
        type="warning"
        message={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Statistic
              title="Estimated Reward"
              value={estimatedRewardAssetText}
            />
            <Statistic
              title="Pool Weight"
              value={convert.toPercent(weight.toNumber())}
              style={{ textAlign: "right" }}
            />
          </div>
        }
      />
      <Button.Group style={{ width: "100%" }}>
        {values.inputType === "stake" && status === "approval needed" ? (
          <Button
            type="primary"
            block={true}
            onClick={approve}
            disabled={Boolean(errors.amount?.displayed)}
          >
            Approve
          </Button>
        ) : (
          <Button
            type="primary"
            danger={values.inputType === "unstake"}
            block={true}
            onClick={handleSubmit}
            disabled={Boolean(errors.amount?.displayed)}
          >
            {values.inputType === "stake" ? "Deposit" : "Withdraw"}
          </Button>
        )}
        <Button
          type="primary"
          danger={values.inputType === "stake"}
          block={true}
          onClick={() =>
            setFieldValue(
              "inputType",
              values.inputType === "stake" ? "unstake" : "stake"
            )
          }
        >
          {values.inputType === "stake" ? "Withdraw" : "Deposit"}
        </Button>
      </Button.Group>
    </Space>
  );
}

function StakingStats({
  decimals,
  symbol,
  portfolioToken,
  stakingToken,
  poolLink,
  stakingTokenLink,
  rewardsPerDay,
  onExit,
  onClaim,
}: {
  decimals: number;
  symbol: string;
  portfolioToken: FormattedPortfolioAsset;
  stakingToken: NewStakingPool | MasterChefPool;
  poolLink: ReactNode;
  stakingTokenLink: string;
  rewardsPerDay: string;
  onExit(): void;
  onClaim(): void;
}) {
  const [staked, earned] = useMemo(() => {
    let staked = stakingToken.userStakedBalance;
    let earned = stakingToken.userEarnedRewards;
    staked = staked
      ? convert.toBalance(staked, portfolioToken.decimals, false, 10)
      : "0";
    earned = earned
      ? convert.toBalance(earned, portfolioToken.decimals, false, 10)
      : "0";

    return [staked, earned];
  }, [stakingToken, portfolioToken.decimals]);

  return (
    <Descriptions bordered={true} column={1}>
      {/* Left Column */}
      {parseFloat(staked) > 0 && (
        <Descriptions.Item label="Staked">
          <Row>
            <Col xs={24} md={14}>
              {staked} {symbol}
            </Col>
            <Col xs={24} md={8}>
              <Button danger type="primary" block={true} onClick={onExit}>
                Exit
              </Button>
            </Col>
          </Row>
        </Descriptions.Item>
      )}
      {parseFloat(earned) > 0 && (
        <Descriptions.Item label="Earned Rewards">
          <Row>
            <Col xs={24} md={14}>
              {earned} NDX
            </Col>
            <Col xs={24} md={8}>
              <Button type="primary" block={true} onClick={onClaim}>
                Claim
              </Button>
            </Col>
          </Row>
        </Descriptions.Item>
      )}

      <Descriptions.Item label="Reward Rate per Day">
        {`${convert.toBalance(rewardsPerDay, 18)} NDX`}
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">{poolLink}</Descriptions.Item>

      {/* Right Column */}
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingToken.totalStaked, decimals, true)} {symbol}
      </Descriptions.Item>

      <Descriptions.Item label="Staking Token">
        <ExternalLink to={stakingTokenLink}>{symbol}</ExternalLink>
      </Descriptions.Item>
    </Descriptions>
  );
}

export function StakeForm({
  decimals,
  protocol,
  spender,
  poolLink,
  stakingTokenLink,
  rewardsPerDay,
  stakingPoolSelector,
  onStake,
  onWithdraw,
  onExit,
  onClaim,
}: {
  decimals: number;
  protocol: "uniswap" | "sushiswap";
  spender: string;
  poolLink: ReactNode;
  stakingTokenLink: string;
  rewardsPerDay: string;
  stakingPoolSelector(
    state: AppState,
    id: string
  ): NewStakingPool | MasterChefPool | undefined;
  onStake(amount: string): void;
  onWithdraw(amount: string): void;
  onExit(): void;
  onClaim(): void;
}) {
  const { isMobile } = useBreakpoints();
  const { id } = useParams<{ id: string }>();
  const data = usePortfolioData({ onlyOwnedAssets: false });
  const toStake = useSelector((state: AppState) =>
    stakingPoolSelector(state, id)
  );
  const relevantPortfolioToken = useMemo(
    () =>
      toStake
        ? data.tokens.find(
            (token) =>
              token.address.toLowerCase() === toStake.token.toLowerCase()
          )
        : null,
    [data.tokens, toStake]
  );
  const balance = useTokenBalance(toStake?.token ?? "");

  if (!(toStake && relevantPortfolioToken)) {
    return null;
  }
  const stakingToken = relevantPortfolioToken.symbol;

  return (
    <Page hasPageHeader={true} title={`Stake ${stakingToken}`}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Row gutter={100}>
          <Col xs={24} md={10}>
            <Formik
              initialValues={{
                asset: "",
                amount: {
                  displayed: "0.00",
                  exact: convert.toBigNumber("0.00"),
                },
                inputType: "stake",
              }}
              onSubmit={console.info}
              validateOnChange={true}
              validateOnBlur={true}
              validate={(values) => {
                const errors: Record<string, string> = {};
                const maximum = parseFloat(
                  values.inputType === "stake"
                    ? balance
                    : convert.toBalance(toStake.userStakedBalance ?? "0")
                );

                if (values.amount.exact.isGreaterThan(maximum)) {
                  errors.amount = "Insufficient balance.";
                }

                return errors;
              }}
            >
              <StakingForm
                token={relevantPortfolioToken}
                stakingToken={toStake}
                protocol={protocol}
                spender={spender}
                onWithdraw={onWithdraw}
                onStake={onStake}
              />
            </Formik>
          </Col>
          <Col xs={24} md={14}>
            {isMobile && <Divider />}
            <StakingStats
              symbol={stakingToken}
              portfolioToken={relevantPortfolioToken}
              stakingToken={toStake}
              onExit={onExit}
              onClaim={onClaim}
              poolLink={poolLink}
              stakingTokenLink={stakingTokenLink}
              decimals={decimals}
              rewardsPerDay={rewardsPerDay}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}

export function UniswapStakeForm() {
  const { id } = useParams<{ id: string }>();
  const { stake, withdraw, exit, claim } = useNewStakingTransactionCallbacks(
    id
  );
  const toStake = useSelector((state: AppState) =>
    selectors.selectNewStakingPool(state, id)
  );

  useNewStakingRegistrar();

  return (
    <StakeForm
      protocol="sushiswap"
      spender={MASTER_CHEF_ADDRESS}
      onStake={stake}
      onWithdraw={withdraw}
      onExit={exit}
      onClaim={claim}
      stakingPoolSelector={selectors.selectNewStakingPool}
      poolLink="https://google.com/"
      stakingTokenLink="https://google.com/"
      rewardsPerDay={toStake?.rewardsPerDay ?? "0.00"}
      decimals={toStake?.decimals ?? 18}
    />
  );
}

export function SushiswapStakeForm() {
  const { id } = useParams<{ id: string }>();
  const { stake, withdraw, exit, claim } = useMasterChefTransactionCallbacks(
    id
  );
  const rewardsPerDay = useMasterChefRewardsPerDay(id);
  const toStake = useSelector((state: AppState) =>
    selectors.selectMasterChefPool(state, id)
  );

  useMasterChefRegistrar();

  return (
    <StakeForm
      protocol="sushiswap"
      spender={MASTER_CHEF_ADDRESS}
      onStake={stake}
      onWithdraw={withdraw}
      onExit={exit}
      onClaim={claim}
      stakingPoolSelector={selectors.selectMasterChefPool}
      poolLink="https://google.com/"
      stakingTokenLink="https://google.com/"
      rewardsPerDay={rewardsPerDay.toString()}
      decimals={18}
    />
  );
}
