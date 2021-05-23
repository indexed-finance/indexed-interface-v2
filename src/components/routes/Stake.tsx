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
import { useMemo } from "react";
import { usePortfolioData } from "hooks";
import { useSelector } from "react-redux";

function StakingForm({ token }: { token: FormattedPortfolioAsset }) {
  const { setFieldValue, setFieldError, values, errors } = useFormikContext<{
    amount: number;
  }>();

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <TokenSelector
            assets={[]}
            value={{
              token: "NFTP",
              amount: values.amount,
            }}
            selectable={false}
            autoFocus={true}
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
        </div>

        <Alert
          type="warning"
          message={
            <Row style={{ textAlign: "center" }}>
              <Col span={12}>
                <Statistic title="Estimated Reward" value="0.00 NDX / Day" />
              </Col>
              <Col span={12}>
                <Statistic title="Pool Weight" value="0.113%" />
              </Col>
            </Row>
          }
        />

        <Space direction="vertical" style={{ width: "100%" }}>
          <Label>Actions</Label>
          <Button type="default" block={true}>
            Stake
          </Button>
          <Button type="default" block={true}>
            Claim
          </Button>
          <Button type="default" block={true}>
            Unstake
          </Button>
          <Button type="default" block={true}>
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
  stakingToken: NormalizedStakingPool;
}) {
  return (
    <Descriptions bordered={true} column={1}>
      {/* Left Column */}
      <Descriptions.Item label="Earned Rewards">
        {portfolioToken.ndxEarned} NDX
      </Descriptions.Item>

      <Descriptions.Item label="Currently Staking">
        {portfolioToken.staking || `0.00 ${symbol}`}
      </Descriptions.Item>

      <Descriptions.Item label="Reward Rate per Day">
        {convert.toBalance(
          (parseFloat(stakingToken.rewardRate) * 86400).toString()
        )}{" "}
        NDX
      </Descriptions.Item>

      <Descriptions.Item label="Rewards Pool">
        <Link to={`https://etherscan.io/address/${stakingToken.id}`}>
          {abbreviateAddress(stakingToken.id)} <BiLinkExternal />
        </Link>
      </Descriptions.Item>

      {/* Right Column */}
      <Descriptions.Item label="Staking Ends">
        {format(stakingToken.periodFinish * 1000, "MMM c, yyyy HH:mm:ss")} UTC
      </Descriptions.Item>
      <Descriptions.Item label="Total Staked">
        {convert.toBalance(stakingToken.totalSupply)} {symbol}
      </Descriptions.Item>
      <Descriptions.Item label="Total NDX per Day">--</Descriptions.Item>
      <Descriptions.Item label="Staking Token">
        {symbol} <BiLinkExternal />
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
  const relevantIndexPool = useSelector((state: AppState) =>
    toStake ? selectors.selectPool(state, toStake.indexPool) : ""
  );
  const relevantPortfolioToken = useMemo(
    () =>
      relevantIndexPool
        ? data.tokens.find((token) => token.symbol === relevantIndexPool.symbol)
        : null,
    [data.tokens, relevantIndexPool]
  );
  const relevantStakingToken = useSelector((state: AppState) =>
    selectors.selectStakingPool(state, id)
  );

  if (
    !(
      toStake &&
      relevantIndexPool &&
      relevantPortfolioToken &&
      relevantStakingToken
    )
  ) {
    return <div>Derp</div>;
  }

  const stakingToken = toStake.isWethPair
    ? `ETH/${relevantIndexPool.symbol}`
    : relevantIndexPool.symbol;

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
              <StakingForm token={relevantPortfolioToken} />
            </Formik>
          </Col>
          <Col span={14}>
            <StakingStats
              symbol={stakingToken}
              portfolioToken={relevantPortfolioToken}
              stakingToken={relevantStakingToken}
            />
          </Col>
        </Row>
      </Space>
    </Page>
  );
}
