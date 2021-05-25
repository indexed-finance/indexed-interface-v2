import { Alert, Button, Col, Descriptions, Row, Space, Statistic } from "antd";
import {
  AppState,
  FormattedPortfolioAsset,
  NormalizedStakingPool,
  selectors,
} from "features";
import { ExternalLink, Label, Page, TokenSelector } from "components/atomic";
import { Formik, useFormikContext } from "formik";
import { Link, useParams } from "react-router-dom";
import { abbreviateAddress, convert } from "helpers";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  usePortfolioData,
  useStakingRegistrar,
  useStakingTransactionCallbacks,
} from "hooks";
import { useSelector } from "react-redux";

function StakingForm({
  token,
  stakingToken,
  expired,
}: {
  token: FormattedPortfolioAsset;
  stakingToken: NormalizedStakingPool;
  expired: boolean;
}) {
  const { setFieldValue, values, errors } = useFormikContext<{
    amount: number;
    inputType: 'stake' | 'unstake';
  }>();
  const { stake, withdraw, exit, claim } = useStakingTransactionCallbacks(
    stakingToken.id
  );

  const [staked, earned] = useMemo(() => {
    let staked = stakingToken.userData?.userStakedBalance;
    let earned = stakingToken.userData?.userRewardsEarned;
    staked = staked ? convert.toBalance(staked, 18) : "0";
    earned = earned ? convert.toBalance(earned, 18) : "0"
    return [staked, earned];
  }, [stakingToken]);

  const [estimatedReward, weight] = useMemo(() => {
    const stakedAmount = parseFloat(staked || "0");
    const addAmount = values.inputType === "stake" ? values.amount : -values.amount;
    const userNewStaked = stakedAmount + addAmount;
    if (userNewStaked < 0 || expired) {
      return [0, 0];
    }
    const totalStaked = convert.toBalanceNumber(stakingToken.totalSupply, 18);
    const newTotalStaked = totalStaked + addAmount;
    const dailyRewardsTotal = convert.toBalanceNumber(
      convert.toBigNumber(stakingToken.rewardRate).times(86400),
      18
    );
    const weight = userNewStaked / newTotalStaked;
    return [convert.toComma(weight * dailyRewardsTotal), weight];
  }, [
    values.amount,
    stakingToken.totalSupply,
    stakingToken.rewardRate,
    staked,
    expired,
    values.inputType,
  ]);

  const handleSubmit = () => {
    if (values.inputType === "stake")
      stake(convert.toToken(values.amount.toString(), 18).toString());
    else withdraw(convert.toToken(values.amount.toString(), 18).toString());
  };

  if (expired) {
    return (
      <>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            style={{ textAlign: "center" }}
            type="warning"
            message="This staking pool has expired. New deposits can not be made,
            and all staked tokens should be withdrawn."
          />
          {parseFloat(staked) > 0 && (
            <>
              <Row
                style={{ textAlign: "center", width: "100%" }}
                justify="center"
              >
                <Col span={16}>
                  <h2>
                    Staked: {staked} {token.symbol}
                  </h2>
                </Col>
              </Row>
              <Row
                style={{ textAlign: "center", width: "100%" }}
                justify="center"
              >
                <Col span={16}>
                  <h2>Rewards: {token.ndxEarned} NDX</h2>
                </Col>
              </Row>

              <Row
                style={{ textAlign: "center", width: "100%" }}
                justify="center"
              >
                <Col span={12}>
                  <Button
                    type="primary"
                    block={true}
                    disabled={parseFloat(staked || "0") <= 0}
                    danger
                    title="Withdraw all staked tokens and rewards."
                    onClick={exit}
                  >
                    Exit
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Space>
      </>
    );
  }

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <TokenSelector
          assets={[]}
          value={{
            token: token.symbol,
            amount: values.amount,
          }}
          balanceLabel={values.inputType === "unstake" ? "Staked" : undefined}
          balanceOverride={values.inputType === "unstake" ? staked : undefined}
          isInput={true}
          autoFocus={true}
          selectable={false}
          onChange={(value) => {
            setFieldValue("amount", value.amount);
          }}
          balance={values.inputType === "unstake" ? staked : token.balance}
          error={errors.amount}
        />

        <Alert
          type="warning"
          message={
            <Row style={{ textAlign: "center" }}>
              <Col span={12}>
                <Statistic
                  title="Estimated Reward"
                  value={`${estimatedReward} NDX / Day`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Pool Weight"
                  value={convert.toPercent(weight)}
                />
              </Col>
            </Row>
          }
        />

        <Button.Group style={{ width: "100%" }}>
          <Button
            type="primary"
            danger={values.inputType === "unstake"}
            block={true}
            onClick={handleSubmit}
            disabled={
              values.inputType === "stake" ? expired : parseFloat(staked || "0") <= 0
            }
          >
            {values.inputType === "stake" ? "Deposit" : "Withdraw"}
          </Button>
          <Button
            type="primary"
            danger={values.inputType === "stake"}
            block={true}
            onClick={() =>
              setFieldValue('inputType', values.inputType === "stake" ? "unstake" : "stake")
            }
          >
            {values.inputType === "stake" ? "Withdraw" : "Deposit"}
          </Button>
        </Button.Group>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Label>Actions</Label>
          <Button
            type="default"
            block={true}
            disabled={parseFloat(earned || "0") <= 0}
            onClick={claim}
            title="Claim NDX rewards"
          >
            Claim
          </Button>
          <Button
            type="default"
            block={true}
            disabled={parseFloat(staked || "0") <= 0}
            title="Withdraw all staked tokens and rewards."
            onClick={exit}
          >
            Exit
          </Button>
        </Space>
      </Space>
    </>
  );
}

function StakingStats({
  symbol,
  stakingToken,
  expired,
}: {
  expired: boolean;
  symbol: string;
  stakingToken: NormalizedStakingPool;
}) {
  const slug = useSelector((state: AppState) =>
    stakingToken.isWethPair
      ? null
      : selectors.selectFormattedIndexPool(state, stakingToken.indexPool)
          ?.slug ?? ""
  );

  const [staked, earned] = useMemo(() => {
    let staked = stakingToken.userData?.userStakedBalance;
    let earned = stakingToken.userData?.userRewardsEarned;
    staked = staked ? convert.toBalance(staked, 18) : "0";
    earned = earned ? convert.toBalance(earned, 18) : "0"
    return [staked, earned];
  }, [stakingToken]);

  return (
    <Descriptions bordered={true} column={1}>
      <Descriptions.Item label="Earned Rewards">
        {parseFloat(earned) > 0 ? (
          <Row style={{ textAlign: "center" }}>
            <Col span={12}>{earned} NDX</Col>
            <Col span={12}>
              <Button type="primary" block={true}>
                Claim
              </Button>
            </Col>
          </Row>
        ) : (
          <>{earned} NDX</>
        )}
      </Descriptions.Item>

      <Descriptions.Item label="Currently Staking">
        {staked} {symbol}
      </Descriptions.Item>

      <Descriptions.Item
        label="Reward Rate per Day"
        contentStyle={{ color: expired ? "#333" : "inherit" }}
      >
        {expired
          ? "Expired"
          : `${convert.toBalance(
              (parseFloat(stakingToken.rewardRate) * 86400).toString()
            )} NDX`}
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">
        <ExternalLink to={`https://etherscan.io/address/${stakingToken.id}`}>
          {abbreviateAddress(stakingToken.id)}
        </ExternalLink>
      </Descriptions.Item>

      <Descriptions.Item
        label={expired ? "Staking Ended" : "Staking Ends"}
        contentStyle={{ color: expired ? "#333" : "inherit" }}
      >
        {format(stakingToken.periodFinish * 1000, "MMM c, yyyy HH:mm:ss")} UTC
      </Descriptions.Item>
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingToken.totalSupply, 18, true)} {symbol}
      </Descriptions.Item>
      <Descriptions.Item label="Staking Token">
        {stakingToken.isWethPair ? (
          <ExternalLink
            to={`https://v2.info.uniswap.org/pair/${stakingToken.stakingToken}`}
          >
            {symbol}
          </ExternalLink>
        ) : (
          <Link to={slug ?? ""}>{symbol}</Link>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function Stake() {
  const { id } = useParams<{ id: string }>();
  const data = usePortfolioData();
  const toStake = useSelector((state: AppState) =>
    selectors.selectStakingPool(state, id)
  );
  const relevantPortfolioToken = useMemo(
    () =>
      toStake
        ? data.tokens.find(
            (token) =>
              token.address.toLowerCase() === toStake.stakingToken.toLowerCase()
          )
        : null,
    [data.tokens, toStake]
  );

  if (!(toStake && relevantPortfolioToken)) {
    return <div>Derp</div>;
  }

  const isExpired = toStake.periodFinish < (Date.now() / 1000);
  const stakingToken = relevantPortfolioToken.symbol

  return (
    <Page hasPageHeader={true} title={`Stake ${stakingToken}`}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Row gutter={100}>
          <Col span={10}>
            <Formik
              initialValues={{
                asset: "",
                amount: 0,
                inputType: 'stake'
              }}
              onSubmit={console.log}
              validateOnChange={true}
              validateOnBlur={true}
              validate={(values) => {
                const errors: Record<string, string> = {};
                const maximum = values.inputType === 'stake'
                  ? parseFloat(convert.toBalance(relevantPortfolioToken.balance))
                  : parseFloat(convert.toBalance(toStake.userData?.userStakedBalance ?? "0"))
                if (values.amount > maximum) {
                  errors.amount = "Insufficient balance.";
                }
                return errors;
              }}
            >
              <StakingForm token={relevantPortfolioToken} stakingToken={toStake} expired={isExpired} />
            </Formik>
          </Col>
          <Col span={14}>
            <StakingStats
              symbol={stakingToken}
              stakingToken={toStake}
              expired={isExpired}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}
