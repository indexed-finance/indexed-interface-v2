import { Alert, Button, Col, Descriptions, Row, Space, Statistic } from "antd";
import {
  AppState,
  FormattedPortfolioAsset,
  NewStakingPool,
  selectors,
} from "features";
import { BiLinkExternal } from "react-icons/bi";
import { Formik, useFormikContext } from "formik";
import { Label, Page, TokenSelector } from "components/atomic";
import { Link, useParams } from "react-router-dom";
import { MULTI_TOKEN_STAKING_ADDRESS } from "config";
import { abbreviateAddress, convert } from "helpers";
import { useMemo, useState } from "react";
import { useNewStakingRegistrar, useNewStakingTransactionCallbacks, usePortfolioData } from "hooks";
import { useSelector } from "react-redux";


function StakingForm({
  token,
  stakingToken
}: {
  token: FormattedPortfolioAsset;
  stakingToken: NewStakingPool;
}) {
  const { setFieldValue, values, errors } = useFormikContext<{
    amount: number;
    inputType: 'stake' | 'unstake';
  }>();

  const {
    stake,
    withdraw,
    exit,
    claim
  } = useNewStakingTransactionCallbacks(stakingToken.id)
  
  const [staked, earned] = useMemo(() => {
    let staked = stakingToken.userStakedBalance;
    let earned = stakingToken.userEarnedRewards;
    staked = staked ? convert.toBalance(staked, 18) : "0";
    earned = earned ? convert.toBalance(earned, 18) : "0"
    return [staked, earned];
  }, [stakingToken]);

  const [estimatedReward, weight] = useMemo(() => {
    const stakedAmount = parseFloat(staked || '0');
    const addAmount = values.inputType === 'stake' ? values.amount : -(values.amount);
    const userNewStaked = stakedAmount + addAmount;
    if (userNewStaked < 0) {
      return [0, 0];
    }
    const totalStaked = convert.toBalanceNumber(stakingToken.totalStaked, 18);
    const newTotalStaked = totalStaked + addAmount;
    const dailyRewardsTotal = convert.toBalanceNumber(
      convert.toBigNumber(stakingToken.rewardsPerDay), 18
    );
    const weight = userNewStaked / newTotalStaked;
    return [
      convert.toComma(weight * dailyRewardsTotal),
      weight
    ]
  }, [values.amount, stakingToken.totalStaked, stakingToken.rewardsPerDay, staked, values.inputType])

  const handleSubmit = () => {
    if (values.inputType === 'stake') stake(convert.toToken(values.amount.toString(), 18).toString());
    else withdraw(convert.toToken(values.amount.toString(), 18).toString())
  }

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row style={{ textAlign: "center" }}>
          <Col span={20}>
            <TokenSelector
              assets={[]}
              value={{
                token: token.symbol,
                amount: values.amount,
              }}
              isInput
              autoFocus
              balanceLabel={values.inputType === 'unstake' ? 'Staked' : undefined}
              balanceOverride={values.inputType === 'unstake' ? staked : undefined}
              selectable={false}
              onChange={(value) => {
                setFieldValue("amount", value.amount);
                /* if (value.amount !== undefined) {
                  setFieldValue("amount", value.amount);

                  if (
                    value.amount > parseFloat(convert.toBalance(token.balance))
                  ) {
                    setFieldError("amount", "Insufficient balance");
                  }
                }  */
              }}
              // balance={values.inputType === "unstake" ? staked : token.balance}
              error={errors.amount}
            />
          </Col>
        </Row>

        <Alert
          type="warning"
          message={
            <Row style={{ textAlign: "center" }}>
              <Col span={12}>
                <Statistic title="Estimated Reward" value={`${estimatedReward} NDX / Day`} />
              </Col>
              <Col span={12}>
                <Statistic title="Pool Weight" value={convert.toPercent(weight)} />
              </Col>
            </Row>
          }
        />
        <Row justify='space-around' style={{ textAlign: "center", width: '100%' }}>
          <Col span={12} style={{ textAlign: 'center', alignSelf: 'center' }}>
            <Button
              type='primary'
              danger={values.inputType === 'unstake'}
              block={true}
              onClick={handleSubmit}
              disabled={values.inputType === 'unstake' && (parseFloat(staked || '0') <= 0)}
            >
              { values.inputType === 'stake' ? 'Deposit' : 'Withdraw' }
            </Button>
          </Col>
          <Col span={4}>
            <Button
              type='primary'
              danger={values.inputType === 'stake'}
              block={true}
              onClick={() => setFieldValue('inputType', values.inputType === 'stake' ? 'unstake' : 'stake')}
            >
            { values.inputType === 'stake' ? 'Withdraw' : 'Deposit' }
            </Button>
          </Col>
        </Row>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Label>Actions</Label>
          <Button
            type="default"
            block={true}
            disabled={parseFloat(earned || '0') <= 0}
            onClick={claim}
            title='Claim NDX rewards'
          >
            Claim
          </Button>
          <Button
            type="default"
            block={true}
            disabled={parseFloat(staked || '0') <= 0}
            title='Withdraw all staked tokens and rewards.'
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
    staked = staked ? convert.toBalance(staked, 18) : "0";
    earned = earned ? convert.toBalance(earned, 18) : "0"
    return [staked, earned];
  }, [stakingToken]);

  return (
    <Descriptions bordered={true} column={1}>
      {/* Left Column */}
      <Descriptions.Item label="Earned Rewards">
        {
          (parseFloat(earned) > 0) ?
          <Row style={{ textAlign: "center" }}>
            <Col span={12}>
              {earned} NDX
            </Col>
            <Col span={12}>
              <Button type="primary" block={true}>
                Claim
              </Button>
            </Col>
          </Row>
          : <>{earned} NDX</>
        }
      </Descriptions.Item>

      <Descriptions.Item label="Currently Staking">
        {staked} {symbol}
      </Descriptions.Item>

      <Descriptions.Item label="Reward Rate per Day" >
        {
          `${convert.toBalance(stakingToken.rewardsPerDay, 18)} NDX`
        }
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">
        <Link to={`https://etherscan.io/address/${MULTI_TOKEN_STAKING_ADDRESS}`}>
          {abbreviateAddress(MULTI_TOKEN_STAKING_ADDRESS)} <BiLinkExternal />
        </Link>
      </Descriptions.Item>

      {/* Right Column */}
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingToken.totalStaked, 18, true)} {symbol}
      </Descriptions.Item>
      <Descriptions.Item label="Staking Token">
        {symbol} <BiLinkExternal />
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function StakeNew() {
  const { id } = useParams<{ id: string }>();

  useNewStakingRegistrar();
  const data = usePortfolioData();
  // console.log(data)
  const toStake = useSelector((state: AppState) =>
    selectors.selectNewStakingPool(state, id)
  );
  const relevantPortfolioToken = useMemo(
    () =>
      toStake
        ? data.tokens.find((token) => (token.address.toLowerCase() === toStake.token.toLowerCase()))
        : null,
    [data.tokens, toStake]
  );

  if (!(toStake && relevantPortfolioToken)) {
    return <div>Derp</div>;
  }

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
                  : parseFloat(convert.toBalance(toStake.userStakedBalance ?? "0"))
                if (values.amount > maximum) {
                  errors.amount = "Insufficient balance.";
                }
                return errors;
              }}
            >
              <StakingForm token={relevantPortfolioToken} stakingToken={toStake} />
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
