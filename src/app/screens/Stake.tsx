import { Col, Row, Typography } from "antd";
import { ScreenHeader } from "components";
import { Staking } from "../subscreens";
import { actions, selectors, useStakingRegistrar } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";
import { useTranslation } from "i18n";

export default function Stake() {
  const translate = useTranslation();
  const staking = useSelector(selectors.selectFormattedStaking);
  const indexTokens = (
    <Staking title={translate("INDEX_TOKENS")} data={staking.indexTokens} />
  );
  const liquidityTokens = (
    <Staking
      title={translate("LIQUIDITY_TOKENS")}
      data={staking.liquidityTokens}
    />
  );
  const breakpoints = useBreakpoints();

  useStakingRegistrar(actions, selectors);

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
      <ScreenHeader title={translate("STAKE")} />
      <Typography.Title level={2}>
        {translate("LIQUIDITY_MINING")}
      </Typography.Title>
      <Typography.Paragraph>
        {translate("STAKE_INDEX_TOKENS_...")}
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
