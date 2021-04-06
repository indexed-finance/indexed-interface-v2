import { AppState, actions, selectors } from "features";
import { Divider, Space, Typography } from "antd";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import {
  PortfolioCard,
  ProviderRequirementDrawer,
  ScreenHeader,
} from "components";
import {
  buildUniswapPairs,
  useEthPrice,
  usePairDataRegistrar,
  useStakingRegistrar,
  useTranslator,
  useUserDataRegistrar,
} from "hooks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";

export default function Portfolio() {
  const tx = useTranslator();
  const dispatch = useDispatch();
  const pools = useSelector(selectors.selectAllPools);
  const poolsToTokens = pools.reduce((prev, next) => {
    prev[next.id] = next.tokens.ids;
    return prev;
  }, {} as Record<string, string[]>);
  const [ethPrice, ethPriceLoading] = useEthPrice();
  const formattedPortfolio = useSelector((state: AppState) =>
    ethPriceLoading
      ? null
      : selectors.selectFormattedPortfolio(state, ethPrice!)
  );
  const uniswapPairs = useMemo(
    () => buildUniswapPairs([NDX_ADDRESS, WETH_CONTRACT_ADDRESS]),
    []
  );

  useStakingRegistrar();
  useUserDataRegistrar(poolsToTokens);
  usePairDataRegistrar(uniswapPairs);

  // Effect:
  // On portfolio load, register the NDX address.
  useEffect(() => {
    dispatch(actions.uniswapPairsRegistered(uniswapPairs));
  }, [dispatch, uniswapPairs]);

  return (
    <div>
      <ProviderRequirementDrawer includeSignerRequirement={true} />
      <ScreenHeader title={tx("PORTFOLIO")} />
      {formattedPortfolio ? (
        <>
          <Space
            wrap={true}
            size="large"
            style={{ width: "100%", alignItems: "stretch" }}
          >
            {formattedPortfolio.tokens.map((token) => (
              <PortfolioCard key={token.address} {...token} />
            ))}
            <PortfolioCard {...formattedPortfolio.ndx} />
          </Space>
          <Divider />
          <Typography.Title style={{ textAlign: "right" }}>
            {tx("TOTAL_VALUE")}{" "}
            <Typography.Text type="success">
              {formattedPortfolio.totalValue}
            </Typography.Text>
          </Typography.Title>
        </>
      ) : null}
    </div>
  );
}
