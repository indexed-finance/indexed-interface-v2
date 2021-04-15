import { Divider, Space, Typography } from "antd";
import {
  PortfolioCard,
  ProviderRequirementDrawer,
  ScreenHeader,
} from "components";
import { usePortfolioData } from "hooks/portfolio-hooks";
import { useStakingRegistrar, useTranslator } from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  useStakingRegistrar();
  const { ndx, tokens, totalNdxEarned, totalValue } = usePortfolioData();

  return (
    <div>
      <ProviderRequirementDrawer includeSignerRequirement={true} />
      <ScreenHeader title={tx("PORTFOLIO")} />
        <>
          <Space
            wrap={true}
            size="large"
            style={{ width: "100%", alignItems: "stretch" }}
          >
            <PortfolioCard {...ndx} />
            {tokens.map((token) => (
              <PortfolioCard key={token.address} {...token} />
            ))}
          </Space>
          <Divider />
          <Typography.Title style={{ textAlign: "right" }}>
            {tx("TOTAL_VALUE")}{" "}
            <Typography.Text type="success">
              {totalValue}
            </Typography.Text>
          </Typography.Title>
        </>
    </div>
  );
}
