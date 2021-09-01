import { Col, Row } from "antd";
import { IndexCard } from "./IndexCard";
import { PortfolioSection } from "./PortfolioSection";
import { convert } from "helpers";
import {
  useAllPortfolioData,
  useBreakpoints,
  useMasterChefRegistrar,
  useNewStakingRegistrar,
  usePortfolioData,
  useStakingRegistrar,
} from "hooks";

export function LiquiditySection() {
  const { isMobile } = useBreakpoints();
  const {
    assets: { liquidity },
  } = useAllPortfolioData();
  const lookup = liquidity.reduce((prev, next) => {
    prev[next.id] = next;
    return prev;
  }, {} as Record<string, typeof liquidity[0]>);
  const { tokens } = usePortfolioData({
    onlyOwnedAssets: true,
  });
  const liquidityTokens = tokens.filter(
    (token) => token.isSushiswapPair || token.isUniswapPair
  );

  useStakingRegistrar();
  useNewStakingRegistrar();
  useMasterChefRegistrar();

  return (
    <PortfolioSection title="Liquidity">
      <Row gutter={12} align="bottom">
        {liquidityTokens.map((token) => {
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
                earnedSymbol={token.isSushiswapPair ? "SUSHI" : "NDX"}
                earnedAmount={
                  token.isSushiswapPair ? token.sushiEarned : token.ndxEarned
                }
              />
            </Col>
          );
        })}
      </Row>
    </PortfolioSection>
  );
}
