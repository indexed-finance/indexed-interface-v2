import { Alert, Button, Col, Descriptions, Row, Space, Statistic } from "antd";
import {
  AppState,
  FormattedPortfolioAsset,
  NormalizedStakingPool,
  selectors,
} from "features";
import { BiLinkExternal } from "react-icons/bi";
import { Formik, useFormikContext } from "formik";
import { Label, Page, TokenSelector } from "components/atomic";
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
  const { setFieldValue, setFieldError, values, errors } = useFormikContext<{
    amount: number;
  }>();
  const [inputType, setInputType] = useState<"stake" | "unstake">("stake");
  const { stake, withdraw, exit, claim } = useStakingTransactionCallbacks(
    stakingToken.id
  );

  const staked = useMemo(() => token.staking, [token.staking]);

  const [estimatedReward, weight] = useMemo(() => {
    const stakedAmount = parseFloat(staked || "0");
    const addAmount = inputType === "stake" ? values.amount : -values.amount;
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
    inputType,
  ]);

  const handleSubmit = () => {
    if (inputType === "stake")
      stake(convert.toToken(values.amount.toString(), 18).toString());
    else withdraw(convert.toToken(values.amount.toString(), 18).toString());
  };

  if (expired) {
    return (
      <>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            type="warning"
            message={
              <Row
                style={{ textAlign: "center", width: "100%" }}
                justify="center"
              >
                <Col span={20}>
                  This staking pool has expired. New deposits can not be made,
                  and all staked tokens should be withdrawn.
                </Col>
              </Row>
            }
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
              balanceLabel={inputType === "unstake" ? "Staked" : undefined}
              balanceOverride={inputType === "unstake" ? staked : undefined}
              selectable={false}
              onChange={(value) => {
                if (value.amount) {
                  setFieldValue("amount", value.amount);

                  if (
                    value.amount > parseFloat(convert.toBalance(token.balance))
                  ) {
                    setFieldError("amount", "Insufficient balance");
                  }
                }
              }}
              balance={token.balance}
              error={errors.amount}
            />
          </Col>
        </Row>

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
            danger={inputType === "unstake"}
            block={true}
            onClick={handleSubmit}
            disabled={
              inputType === "stake" ? expired : parseFloat(staked || "0") <= 0
            }
          >
            {inputType === "stake" ? "Deposit" : "Withdraw"}
          </Button>
          <Button
            type="primary"
            danger={inputType === "stake"}
            block={true}
            onClick={() =>
              setInputType(inputType === "stake" ? "unstake" : "stake")
            }
          >
            {inputType === "stake" ? "Withdraw" : "Deposit"}
          </Button>
        </Button.Group>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Label>Actions</Label>
          <Button
            type="default"
            block={true}
            disabled={parseFloat(staked || "0") <= 0}
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
  portfolioToken,
  stakingToken,
  expired,
}: {
  expired: boolean;
  symbol: string;
  portfolioToken: FormattedPortfolioAsset;
  stakingToken: NormalizedStakingPool;
}) {
  return (
    <Descriptions bordered={true} column={1}>
      {/* Left Column */}
      <Descriptions.Item label="Earned Rewards">
        {+portfolioToken.ndxEarned > 0 ? (
          <Row style={{ textAlign: "center" }}>
            <Col span={12}>{portfolioToken.ndxEarned} NDX</Col>
            <Col span={12}>
              <Button type="primary" block={true}>
                Claim
              </Button>
            </Col>
          </Row>
        ) : (
          <>{portfolioToken.ndxEarned} NDX</>
        )}
      </Descriptions.Item>

      <Descriptions.Item label="Currently Staking">
        {portfolioToken.staking || `0.00`} {symbol}
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
        <Link to={`https://etherscan.io/address/${stakingToken.id}`}>
          {abbreviateAddress(stakingToken.id)} <BiLinkExternal />
        </Link>
      </Descriptions.Item>

      {/* Right Column */}
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
        {symbol} <BiLinkExternal />
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function Stake() {
  const { id } = useParams<{ id: string }>();

  useStakingRegistrar();
  const data = usePortfolioData();
  // console.log(data)
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
  const relevantStakingToken = useSelector((state: AppState) =>
    selectors.selectStakingPool(state, id)
  );

  if (!(toStake && relevantPortfolioToken && relevantStakingToken)) {
    return <div>Derp</div>;
  }

  const isExpired = relevantStakingToken.periodFinish < Date.now() / 1000;
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
              }}
              onSubmit={console.log}
            >
              <StakingForm
                token={relevantPortfolioToken}
                stakingToken={relevantStakingToken}
                expired={isExpired}
              />
            </Formik>
          </Col>
          <Col span={14}>
            <StakingStats
              symbol={stakingToken}
              portfolioToken={relevantPortfolioToken}
              stakingToken={relevantStakingToken}
              expired={isExpired}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}
