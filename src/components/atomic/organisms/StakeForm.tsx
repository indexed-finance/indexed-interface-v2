import { Alert, Button, Col, Divider, Row, Space, Statistic } from "antd";
import { BigNumber } from "ethereum";
import {
  FormattedPortfolioAsset,
  MasterChefPool,
  NewStakingPool,
} from "features";
import { Formik, useFormikContext } from "formik";
import { Page } from "./Page";
import { ReactNode, useMemo } from "react";
import { StakingStats } from "./StakeStats";
import { TokenSelector } from "./TokenSelector";
import { convert } from "helpers";
import { useBreakpoints, useTokenApproval, useTokenBalance } from "hooks";

export function StakeForm({
  stakingPool,
  portfolioToken,
  rewardsPerDay,
  rewardsAsset,
  decimals,
  spender,
  onStake,
  onWithdraw,
  onExit,
  onClaim,
  poolLink,
  stakingTokenLink,
  formatAssetText,
}: {
  stakingPool: NewStakingPool | MasterChefPool;
  portfolioToken: FormattedPortfolioAsset;
  rewardsPerDay: string;
  rewardsAsset: string;
  decimals: number;
  spender: string;
  onStake(amount: string): void;
  onWithdraw(amount: string): void;
  onExit(): void;
  onClaim(): void;
  poolLink: ReactNode;
  stakingTokenLink: ReactNode;
  formatAssetText(amount: string): string;
}) {
  const { isMobile } = useBreakpoints();
  const balance = useTokenBalance(stakingPool?.token ?? "");

  return (
    <Page hasPageHeader={true} title={`Stake ${portfolioToken.symbol}`}>
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
                    : convert.toBalance(stakingPool.userStakedBalance ?? "0")
                );

                if (values.amount.exact.isGreaterThan(maximum)) {
                  errors.amount = "Insufficient balance.";
                }

                return errors;
              }}
            >
              <StakeFormInner
                rewardsPerDay={rewardsPerDay}
                token={portfolioToken}
                stakingPool={stakingPool}
                spender={spender}
                onWithdraw={onWithdraw}
                onStake={onStake}
                formatAssetText={formatAssetText}
              />
            </Formik>
          </Col>
          <Col xs={24} md={14}>
            {isMobile && <Divider />}
            <StakingStats
              symbol={portfolioToken.symbol}
              portfolioToken={portfolioToken}
              stakingPool={stakingPool}
              onExit={onExit}
              onClaim={onClaim}
              poolLink={poolLink}
              stakingPoolLink={stakingTokenLink}
              decimals={decimals}
              rewardsPerDay={rewardsPerDay}
              rewardsAsset={rewardsAsset}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}

function StakeFormInner({
  token,
  stakingPool,
  rewardsPerDay,
  spender,
  onStake,
  onWithdraw,
  formatAssetText,
}: {
  token: FormattedPortfolioAsset;
  stakingPool: NewStakingPool | MasterChefPool;
  rewardsPerDay: string;
  spender: string;
  onStake(amount: string): void;
  onWithdraw(amount: string): void;
  formatAssetText(amount: string): string;
}) {
  const { setFieldValue, values, errors } = useFormikContext<{
    amount: {
      displayed: string;
      exact: BigNumber;
    };
    inputType: "stake" | "unstake";
  }>();
  const [staked] = useMemo(() => {
    const staked = stakingPool.userStakedBalance;
    const earned = stakingPool.userEarnedRewards;

    return [staked, earned];
  }, [stakingPool]);
  const [estimatedReward, weight] = useMemo<[string, BigNumber]>(() => {
    const stakedAmount = convert.toBigNumber(staked ?? "0");
    const addAmount = convert.toToken(
      values.inputType === "stake"
        ? values.amount.exact
        : values.amount.exact.negated(),
      18
    );
    const userNewStaked = stakedAmount.plus(addAmount);

    if (userNewStaked.isLessThan(0)) {
      return ["0.00", convert.toBigNumber("0.00")];
    }

    const totalStaked = convert.toBigNumber(stakingPool.totalStaked);
    const newTotalStaked = totalStaked.plus(addAmount);
    const weight = userNewStaked.dividedBy(newTotalStaked);
    const dailyRewardsTotal = convert.toBalanceNumber(rewardsPerDay);
    const result = weight.multipliedBy(dailyRewardsTotal);

    return [convert.toComma(result.toNumber()), weight];
  }, [values.amount, stakingPool, staked, values.inputType, rewardsPerDay]);
  const handleSubmit = () => {
    (values.inputType === "stake" ? onStake : onWithdraw)(
      convert.toToken(values.amount.exact, token.decimals).toString()
    );
  };
  const balance = useTokenBalance(stakingPool.token);
  const { status, approve } = useTokenApproval({
    spender,
    tokenId: stakingPool.token,
    amount: values.amount.displayed,
    rawAmount: values.amount.exact.toString(),
    symbol: stakingPool.token,
  });
  const estimatedRewardAssetText = formatAssetText(estimatedReward);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <TokenSelector
        assets={[]}
        value={{
          token: token.symbol,
          amount: values.amount,
        }}
        isInput={true}
        autoFocus={true}
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
