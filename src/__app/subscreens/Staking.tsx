import { Col, Row } from "antd";
import { StakingCard } from "components";
import { selectors } from "features";
import { useBreakpoints, useStakingRegistrar, useTranslator } from "hooks";
import { useSelector } from "react-redux";
import type { FormattedStakingData } from "features";

function Staking({ data }: { data: FormattedStakingData[] }) {
  return (
    <div style={{ padding: 30 }}>
      {data.map((datum) => (
        <StakingCard key={datum.id} {...datum} />
      ))}
    </div>
  );
}

export default function Stake() {
  const staking = useSelector(selectors.selectFormattedStaking);
  const indexTokens = <Staking data={staking.indexTokens} />;
  const liquidityTokens = <Staking data={staking.liquidityTokens} />;
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
    </>
  );
}
