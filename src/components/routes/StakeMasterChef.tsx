import { Alert, Button, Col, Descriptions, Row, Space, Statistic } from "antd";
import {
  AppState,
  FormattedPortfolioAsset,
  NewStakingPool,
  selectors,
} from "features";
import { ExternalLink, Page, TokenSelector } from "components/atomic";
import { Formik, useFormikContext } from "formik";
import { Link, useParams } from "react-router-dom";
import { MASTER_CHEF_ADDRESS } from "config";
import { MasterChefPool } from "features/masterChef";
import { abbreviateAddress, convert, sushiswapAddLiquidityLink, sushiswapInfoPairLink } from "helpers";
import {
  useBalanceAndApprovalRegistrar,
  useMasterChefTransactionCallbacks,
  usePair,
  usePortfolioData,
  useToken,
  useTokenApproval,
  useTokenBalance,
} from "hooks";
import { useMasterChefRegistrar, useMasterChefRewardsPerDay } from "hooks/masterchef-hooks";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import S from "string";

function StakingForm({
  token,
  stakingToken,
}: {
  token: FormattedPortfolioAsset;
  stakingToken: MasterChefPool;
}) {
  const { setFieldValue, values, errors } = useFormikContext<{
    amount: number;
    inputType: "stake" | "unstake";
  }>();

  const { stake, withdraw } = useMasterChefTransactionCallbacks(stakingToken.id);
  const rewardsPerDay = useMasterChefRewardsPerDay(stakingToken.id);

  const [staked] = useMemo(() => {
    let staked = stakingToken.userStakedBalance;
    let earned = stakingToken.userEarnedRewards;
    staked = staked ? convert.toBalance(staked, 18) : "0";
    earned = earned ? convert.toBalance(earned, 18) : "0";
    return [staked, earned];
  }, [stakingToken]);

  const [estimatedReward, weight] = useMemo(() => {
    const stakedAmount = parseFloat(staked || "0");
    const addAmount =
      values.inputType === "stake" ? values.amount : -values.amount;
    const userNewStaked = stakedAmount + addAmount;
    if (userNewStaked < 0) {
      return [0, 0];
    }
    const totalStaked = convert.toBalanceNumber(stakingToken.totalStaked, 18);
    const newTotalStaked = totalStaked + addAmount;
    const weight = userNewStaked / newTotalStaked;
    const dailyRewardsTotal = convert.toBalanceNumber(rewardsPerDay);
    return [convert.toComma(weight * dailyRewardsTotal), weight];
  }, [
    values.amount,
    stakingToken.totalStaked,
    rewardsPerDay,
    staked,
    values.inputType,
  ]);

  const handleSubmit = () => {
    if (values.inputType === "stake")
      stake(convert.toToken(values.amount.toString(), 18).toString());
    else withdraw(convert.toToken(values.amount.toString(), 18).toString());
  };

  useBalanceAndApprovalRegistrar(MASTER_CHEF_ADDRESS, [
    stakingToken.token,
  ]);
  const balance = useTokenBalance(stakingToken.token);
  console.log(`BALANCE ${balance}`)
  const [amount, rawAmount] = useMemo(() => {
    return [
      values.amount.toString(),
      convert
        .toToken(values.amount.toString(), 18)
        .toString(),
    ];
  }, [values]);
  const { status, approve } = useTokenApproval({
    spender: MASTER_CHEF_ADDRESS,
    tokenId: stakingToken.token,
    amount,
    rawAmount,
    symbol: token.symbol,
  });

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
            ? staked
            : convert.toBalance(balance, token.decimals, false, 4)
        }
        selectable={false}
        onChange={(value) => setFieldValue("amount", value.amount)}
        error={errors.amount}
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
              value={`${estimatedReward} SUSHI / Day`}
            />
            <Statistic
              title="Pool Weight"
              value={convert.toPercent(weight)}
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
            disabled={!!errors.amount}
          >
            Approve
          </Button>
        ) : (
          <Button
            type="primary"
            danger={values.inputType === "unstake"}
            block={true}
            onClick={handleSubmit}
            disabled={!!errors.amount}
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
  stakingToken,
}: {
  symbol: string;
  portfolioToken: FormattedPortfolioAsset;
  stakingToken: MasterChefPool;
}) {
  const [staked, earned] = useMemo(() => {
    let staked = stakingToken.userStakedBalance;
    let earned = stakingToken.userEarnedRewards;
    staked = staked ? convert.toBalance(staked, 18, false, 10) : "0";
    earned = earned ? convert.toBalance(earned, 18, false, 10) : "0";
    return [staked, earned];
  }, [stakingToken]);
  const rewardsPerDay = useMasterChefRewardsPerDay(stakingToken.id);

  const { exit, claim } = useMasterChefTransactionCallbacks(stakingToken.id);
  const pair = usePair(stakingToken.token);
  const url = (pair && pair.token0 && pair.token1)
    ? sushiswapAddLiquidityLink(pair.token0, pair.token1)
    : sushiswapInfoPairLink(stakingToken.token);

  return (
    <Descriptions bordered={true} column={1}>
      {/* Left Column */}
      {parseFloat(staked) > 0 && (
        <Descriptions.Item label="Staked">
          <Row>
            <Col span={14}>
              {staked} {symbol}
            </Col>
            <Col span={8}>
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
            <Col span={14}>{earned} SUSHI</Col>
            <Col span={8}>
              <Button type="primary" block={true} onClick={claim}>
                Claim
              </Button>
            </Col>
          </Row>
        </Descriptions.Item>
      )}

      <Descriptions.Item label="Reward Rate per Day">
        {`${convert.toBalance(rewardsPerDay, 18)} SUSHI`}
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">
        <ExternalLink
          to={`https://etherscan.io/address/${MASTER_CHEF_ADDRESS}`}
        >
          {abbreviateAddress(MASTER_CHEF_ADDRESS)}
        </ExternalLink>
      </Descriptions.Item>

      {/* Right Column */}
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingToken.totalStaked, 18, true)} {symbol}
      </Descriptions.Item>
      <Descriptions.Item label="Staking Token">
        <ExternalLink to={url}>
          {symbol}
        </ExternalLink>
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function StakeMasterChef() {
  const { id } = useParams<{ id: string }>();

  useMasterChefRegistrar();
  const data = usePortfolioData({ onlyOwnedAssets: false });
  const toStake = useSelector((state: AppState) =>
    selectors.selectMasterChefPool(state, id)
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
    return <div>Derp</div>;
  }

  const stakingToken = relevantPortfolioToken.symbol;

  return (
    <Page hasPageHeader={true} title={`Stake ${stakingToken}`}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Row gutter={100}>
          <Col span={10}>
            <Formik
              initialValues={{
                asset: "",
                amount: 0,
                inputType: "stake",
              }}
              onSubmit={console.log}
              validateOnChange={true}
              validateOnBlur={true}
              validate={(values) => {
                const errors: Record<string, string> = {};
                const maximum =
                  values.inputType === "stake"
                    ? parseFloat(
                      convert.toBalance(balance ?? "0")
                    )
                    : parseFloat(
                        convert.toBalance(toStake.userStakedBalance ?? "0")
                      );
                if (values.amount > maximum) {
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
          <Col span={14}>
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
