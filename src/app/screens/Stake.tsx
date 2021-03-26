import { Col, Row, Typography } from "antd";
import { ScreenHeader } from "components";
import { Staking } from "../subscreens";
import { selectors, useStakingRegistrar } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";

export default function Stake() {
  const userAddress = useSelector(selectors.selectUserAddress);
  const staking = useSelector(selectors.selectFormattedStaking);
  const indexTokens = (
    <Staking title="Index Tokens" data={staking.indexTokens} />
  );
  const liquidityTokens = (
    <Staking title="Liquidity Tokens" data={staking.liquidityTokens} />
  );
  const breakpoints = useBreakpoints();

  useStakingRegistrar(userAddress);

  // Variants
  const mobileSized = (
    <Row>
      <Col span={24}>{indexTokens}</Col>
      <Col span={24}>{liquidityTokens}</Col>
    </Row>
  );
  const desktopSized = (
    <Row gutter={20}>
      <Col span={12}>{indexTokens}</Col>
      <Col span={12}>{liquidityTokens}</Col>
    </Row>
  );

  return (
    <>
      <ScreenHeader title="Stake" />
      <Typography.Title>Liquidity mining</Typography.Title>
      <Typography.Paragraph>
        Stake index tokens or their associated Uniswap liquidity tokens to earn
        NDX, the governance token for Indexed Finance.
      </Typography.Paragraph>
      <div style={{ marginTop: 50 }}>
        {(() => {
          switch (true) {
            case breakpoints.xxl:
              return desktopSized;
            case breakpoints.xl:
              return desktopSized;
            case breakpoints.lg:
              return desktopSized;
            case breakpoints.md:
              return mobileSized;
            case breakpoints.sm:
              return mobileSized;
            case breakpoints.xs:
              return mobileSized;
          }
        })()}
      </div>
    </>
  );
}
