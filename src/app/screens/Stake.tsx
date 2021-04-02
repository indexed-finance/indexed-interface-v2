import { Col, Row, Typography } from "antd";
import { ScreenHeader } from "components";
import { Staking } from "../subscreens";
import { selectors } from "features";
import { useBreakpoints, useStakingRegistrar, useTranslator } from "hooks";
import { useSelector } from "react-redux";

export default function Stake() {
  const tx = useTranslator();
  const staking = useSelector(selectors.selectFormattedStaking);
  const indexTokens = (
    <Staking title={tx("INDEX_TOKENS")} data={staking.indexTokens} />
  );
  const liquidityTokens = (
    <Staking title={tx("LIQUIDITY_TOKENS")} data={staking.liquidityTokens} />
  );
  const breakpoints = useBreakpoints();

  useStakingRegistrar();

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
      <ScreenHeader title={tx("STAKE")} />
      <Typography.Title level={2}>{tx("LIQUIDITY_MINING")}</Typography.Title>
      <Typography.Paragraph>
        {tx("STAKE_INDEX_TOKENS_...")}
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
