import { AiOutlineWarning } from "react-icons/ai";
import { Alert, Card, Checkbox, Col, Empty, Row, Typography } from "antd";
import {
  ExpiredStakingCard,
  Page,
  SingleSidedStakingCard,
  SushiswapStakingCard,
  UniswapStakingCard,
} from "components/atomic";
import { Fade } from "components/animations";
import { ReactNode, useCallback, useEffect, useState } from "react";
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
  const [fadedCard, setFadedCard] = useState(-1);
  const inner = (
    <>
      {showing.singleSided &&
        newStakingDetail.indexTokens.map((stakingPool, index) => (
          <Fade key={stakingPool.id} in={fadedCard >= index}>
            <SingleSidedStakingCard {...stakingPool} />
          </Fade>
        ))}

      {showing.sushiswap &&
        masterChefDetail.map((stakingPool, index) => (
          <Fade key={stakingPool.id} in={fadedCard >= index}>
            <SushiswapStakingCard key={stakingPool.id} {...stakingPool} />
          </Fade>
        ))}

      {showing.uniswap &&
        newStakingDetail.liquidityTokens.map((stakingPool, index) => (
          <Fade key={stakingPool.id} in={fadedCard >= index}>
            <UniswapStakingCard key={stakingPool.id} {...stakingPool} />
          </Fade>
        ))}

      {showing.expired && (
        <ExpiredAlert>
          {stakingDetail.indexTokens.map((stakingPool, index) => (
            <Fade key={stakingPool.id} in={fadedCard >= index}>
              <ExpiredStakingCard key={stakingPool.id} {...stakingPool} />
            </Fade>
          ))}
          {stakingDetail.liquidityTokens.map((stakingPool, index) => (
            <Fade key={stakingPool.id} in={fadedCard >= index}>
              <ExpiredStakingCard key={stakingPool.id} {...stakingPool} />
            </Fade>
          ))}
        </ExpiredAlert>
      )}
      {showingNothing && <Empty />}
    </>
  );

  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  useEffect(() => {
    if (fadedCard < 50) {
      setTimeout(() => {
        setFadedCard((prev) => prev + 1);
      }, 200);
    }
  }, [fadedCard]);

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

      {isMobile ? (
        inner
      ) : (
        <Card
          bordered={true}
          style={{ marginTop: 24 }}
          title={
            <Row gutter={24}>
              <Col xs={24} sm={6}>
                Asset
              </Col>
              <Col xs={24} sm={5}>
                Rewards
              </Col>
              <Col xs={24} sm={6}>
                Total Staked
              </Col>
              <Col xs={24} sm={4} style={{ textAlign: "right" }}>
                APY
              </Col>
            </Row>
          }
        >
          {inner}
        </Card>
      )}
    </Page>
  );
}

function StakingViewOptions({
  onChange,
}: {
  onChange(activeKeys: (string | number | boolean)[]): void;
}) {
  const { lg } = useBreakpoints();

  return (
    <Checkbox.Group
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: lg ? "row" : "column",
      }}
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

function ExpiredAlert({ children }: { children?: ReactNode }) {
  return (
    <Alert
      type="error"
      style={{ marginTop: 24 }}
      showIcon={true}
      message="Expired"
      description={
        <>
          These pools are no longer distributing rewards.
          {children}
        </>
      }
    />
  );
}
