import { Col, Row } from "antd";
import { IndexCard } from "./IndexCard";
import { PortfolioSection } from "./PortfolioSection";
import { convert } from "helpers";
import { useAllPortfolioData, useBreakpoints, usePortfolioData } from "hooks";

export function IndexSection() {
  const { isMobile } = useBreakpoints();
  const {
    assets: { indexes },
  } = useAllPortfolioData();
  const lookup = indexes.reduce((prev, next) => {
    prev[next.id] = next;
    return prev;
  }, {} as Record<string, typeof indexes[0]>);
  const { tokens } = usePortfolioData({
    onlyOwnedAssets: true,
  });
  const indexTokens = tokens.filter(
    (token) => !token.isSushiswapPair && !token.isUniswapPair
  );

  return (
    <PortfolioSection title="Indexes">
      <Row gutter={12} align="bottom">
        {indexTokens.map((token) => {
          const entry = lookup[token.address];
          const walletAmount = entry.inWallet.amount.toFixed(2);
          const walletUsdValue = convert.toCurrency(entry.inWallet.value);
          const accruedAmount = entry.accrued.amount.toFixed(2);
          const accruedUsdValue = convert.toCurrency(entry.accrued.value);
          const stakingAmount = entry.staking.amount.toFixed(2);
          const stakingUsdValue = convert.toCurrency(entry.staking.value);

          return (
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
                walletAmount={walletAmount}
                walletUsdValue={walletUsdValue}
                accruedAmount={accruedAmount}
                accruedUsdValue={accruedUsdValue}
                accruedSymbol={entry.accrued.symbol}
                stakingAmount={stakingAmount}
                stakingUsdValue={stakingUsdValue}
                hasStakingPool={token.hasStakingPool}
                staking={token.staking}
                earnedSymbol="NDX"
                earnedAmount={token.ndxEarned}
              />
            </Col>
          );
        })}
      </Row>
    </PortfolioSection>
  );
}
