import { AiOutlineWarning } from "react-icons/ai";
import { Card, Checkbox, Col, Empty, Row, Typography } from "antd";
import { Page, StakingCard } from "components/atomic";
import { ReactNode, useCallback, useState } from "react";
import { selectors } from "features";
import {
  useBreakpoints,
  useNewStakingRegistrar,
  useStakingRegistrar,
  useTranslator,
} from "hooks";
import { useMasterChefRegistrar } from "hooks/masterchef-hooks";
import { useSelector } from "react-redux";

export default function Stake() {
  const tx = useTranslator();
  const stakingDetail = useSelector(selectors.selectFormattedStaking);
  const newStakingDetail = useSelector(selectors.selectNewFormattedStaking);
  const masterChefDetail = useSelector(
    selectors.selectMasterChefFormattedStaking
  );
  const { isMobile } = useBreakpoints();
  const [showing, setShowing] = useState({
    singleSided: true,
    sushiswap: true,
    uniswap: true,
    expired: false,
  });
  const handleViewOptionsChange = useCallback(
    (activeKeys: (string | number | boolean)[]) =>
      setShowing({
        singleSided: activeKeys.includes("single-sided"),
        sushiswap: activeKeys.includes("sushiswap"),
        uniswap: activeKeys.includes("uniswap"),
        expired: activeKeys.includes("expired"),
      }),
    []
  );
  const showingNothing = !Object.values(showing).some(Boolean);

  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  return (
    <Page
      hasPageHeader={true}
      title={
        <>
          <Typography.Title level={isMobile ? 5 : 2}>
            {tx("LIQUIDITY_MINING")}
          </Typography.Title>
        </>
      }
    >
      <StakingViewOptions onChange={handleViewOptionsChange} />

      <Card
        bordered={true}
        style={{ marginTop: 24 }}
        title={
          <Row gutter={24}>
            <Col span={9}>Asset</Col>
            <Col span={5}>Rewards</Col>
            <Col span={7}>Total Staked</Col>
            <Col span={3}>APY</Col>
          </Row>
        }
      >
        {showing.singleSided &&
          newStakingDetail.indexTokens.map((stakingPool) => (
            <StakingCard key={stakingPool.id} {...stakingPool} />
          ))}

        {showing.sushiswap &&
          masterChefDetail.map((stakingPool) => (
            <StakingCard key={stakingPool.id} {...stakingPool} />
          ))}

        {showing.uniswap &&
          newStakingDetail.liquidityTokens.map((stakingPool) => (
            <StakingCard key={stakingPool.id} {...stakingPool} />
          ))}

        {showing.expired &&
          stakingDetail.indexTokens.map((stakingPool) => (
            <StakingCard key={stakingPool.id} {...stakingPool} />
          ))}
        {showingNothing && <Empty />}
      </Card>
    </Page>
  );
}

function StakingViewOptions({
  onChange,
}: {
  onChange(activeKeys: (string | number | boolean)[]): void;
}) {
  return (
    <Checkbox.Group
      style={{ width: "100%", display: "flex", alignItems: "center" }}
      defaultValue={["single-sided", "sushiswap", "uniswap"]}
      onChange={onChange}
    >
      <StakingViewOption
        name="single-sided"
        image={require("images/indexed.png").default}
      >
        Show Single-Sided
      </StakingViewOption>
      <StakingViewOption
        name="sushiswap"
        image={require("images/sushi.png").default}
      >
        Show Sushiswap
      </StakingViewOption>
      <StakingViewOption
        name="uniswap"
        image={require("images/uni.png").default}
      >
        Show Uniswap
      </StakingViewOption>
      <StakingViewOption
        name="expired"
        icon={
          <Typography.Text type="danger">
            <AiOutlineWarning fontSize={54} />
          </Typography.Text>
        }
      >
        Show Expired
      </StakingViewOption>
    </Checkbox.Group>
  );
}

function StakingViewOption({
  name,
  children,
  image,
  icon: Icon,
}: {
  name: string;
  children: ReactNode;
  image?: string;
  icon?: any;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {image && (
        <img
          alt={`Staking Option ${name}`}
          src={image}
          style={{ width: 48, height: 48, marginBottom: 12 }}
        />
      )}
      {Icon}
      <Checkbox name={name} value={name}>
        {children}
      </Checkbox>
    </div>
  );
}
