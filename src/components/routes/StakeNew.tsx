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
  FormattedPortfolioAsset,
  NewStakingPool,
  selectors,
} from "features";
import { ExternalLink, Page, TokenSelector } from "components/atomic";
import { Formik, useFormikContext } from "formik";
import { Link, useParams } from "react-router-dom";
import { MULTI_TOKEN_STAKING_ADDRESS } from "config";
import { abbreviateAddress, convert } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useBreakpoints,
  useNewStakingRegistrar,
  useNewStakingTransactionCallbacks,
  usePortfolioData,
  useTokenApproval,
  useTokenBalance,
} from "hooks";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import S from "string";

function StakingForm({
  token,
  stakingToken,
}: {
  token: FormattedPortfolioAsset;
  stakingToken: NewStakingPool;
}) {
  const { setFieldValue, values, errors } = useFormikContext<{
    amount: {
      displayed: string;
      exact: BigNumber;
    };
    inputType: "stake" | "unstake";
  }>();

  const { stake, withdraw } = useNewStakingTransactionCallbacks(
    stakingToken.id
  );

  const [staked] = useMemo(() => {
    const staked = stakingToken.userStakedBalance;
    const earned = stakingToken.userEarnedRewards;

    return [staked, earned];
  }, [stakingToken]);

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
    const dailyRewardsTotal = convert.toBalanceNumber(
      convert.toBigNumber(stakingToken.rewardsPerDay),
      stakingToken.decimals
    );
    const weight = userNewStaked.dividedBy(newTotalStaked);
    const result = weight.multipliedBy(dailyRewardsTotal);

    return [convert.toComma(result.toNumber()), weight];
  }, [
    values.amount,
    stakingToken.decimals,
    stakingToken.totalStaked,
    stakingToken.rewardsPerDay,
    staked,
    values.inputType,
  ]);

  const handleSubmit = () => {
    (values.inputType === "stake" ? stake : withdraw)(
      convert.toToken(values.amount.exact, token.decimals).toString()
    );
  };
  const balance = useTokenBalance(stakingToken.token);
  const { status, approve } = useTokenApproval({
    spender: MULTI_TOKEN_STAKING_ADDRESS,
    tokenId: stakingToken.token,
    amount: values.amount.displayed,
    rawAmount: values.amount.exact.toString(),
    symbol: stakingToken.symbol,
  });

  useBalanceAndApprovalRegistrar(MULTI_TOKEN_STAKING_ADDRESS, [
    stakingToken.token,
  ]);

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
              value={`${estimatedReward} NDX / Day`}
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
  symbol,
  portfolioToken,
  stakingToken,
}: {
  symbol: string;
  portfolioToken: FormattedPortfolioAsset;
  stakingToken: NewStakingPool;
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
  const { exit, claim } = useNewStakingTransactionCallbacks(stakingToken.id);

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
              <Button danger type="primary" block={true} onClick={exit}>
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
              <Button type="primary" block={true} onClick={claim}>
                Claim
              </Button>
            </Col>
          </Row>
        </Descriptions.Item>
      )}

      <Descriptions.Item label="Reward Rate per Day">
        {`${convert.toBalance(stakingToken.rewardsPerDay, 18)} NDX`}
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">
        <ExternalLink
          to={`https://etherscan.io/address/${MULTI_TOKEN_STAKING_ADDRESS}`}
        >
          {abbreviateAddress(MULTI_TOKEN_STAKING_ADDRESS)}
        </ExternalLink>
      </Descriptions.Item>

      {/* Right Column */}
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingToken.totalStaked, 18, true)} {symbol}
      </Descriptions.Item>
      <Descriptions.Item label="Staking Token">
        {stakingToken.isWethPair ? (
          <ExternalLink
            to={`https://v2.info.uniswap.org/pair/${stakingToken.token}`}
          >
            {symbol}
          </ExternalLink>
        ) : (
          <Link to={`/index-pools/${S(stakingToken.name).slugify().s}`}>
            {symbol}
          </Link>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function StakeNew() {
  useNewStakingRegistrar();

  const { isMobile } = useBreakpoints();
  const { id } = useParams<{ id: string }>();
  const data = usePortfolioData({ onlyOwnedAssets: false });
  const toStake = useSelector((state: AppState) =>
    selectors.selectNewStakingPool(state, id)
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
              onSubmit={console.log}
              validateOnChange={true}
              validateOnBlur={true}
              validate={(values) => {
                const errors: Record<string, string> = {};
                const maximum = parseFloat(
                  values.inputType === "stake"
                    ? relevantPortfolioToken.balance
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
              />
            </Formik>
          </Col>
          <Col xs={24} md={14}>
            {isMobile && <Divider />}
            <StakingStats
              symbol={stakingToken}
              portfolioToken={relevantPortfolioToken}
              stakingToken={toStake}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}
