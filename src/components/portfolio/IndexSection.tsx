import { Col, Row } from "antd";
import { IndexCard } from "./IndexCard";
import { PortfolioSection } from "./PortfolioSection";
import { convert } from "helpers";
import { useBreakpoints, usePortfolioData } from "hooks";

export function IndexSection() {
  const { isMobile } = useBreakpoints();
  const { tokens } = usePortfolioData({
    onlyOwnedAssets: true,
  });
  const indexTokens = tokens.filter(
    (token) => !token.isSushiswapPair && !token.isUniswapPair
  );
  const sectionWalletUsdValue = convert.toCurrency(
    indexTokens
      .map((token) => token.value.replace(/\$/g, ""))
      .map((value) => parseFloat(value))
      .reduce((prev, next) => prev + next, 0)
  );

  return (
    <PortfolioSection
      title="Indexes"
      walletUsdValue={sectionWalletUsdValue}
      accruedUsdValue="$250.00"
    >
      <Row gutter={12} align="bottom">
        {indexTokens.map((token) => (
          <Col
            key={token.address}
            xs={24}
            lg={8}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <IndexCard
              name={token.name}
              symbol={token.symbol}
              address={token.address}
              walletAmount={token.balance}
              walletUsdValue={token.value}
              hasStakingPool={token.hasStakingPool}
              staking={token.staking}
              earnedSymbol="NDX"
              earnedAmount={token.ndxEarned}
            />
          </Col>
        ))}
      </Row>
    </PortfolioSection>
  );
}
