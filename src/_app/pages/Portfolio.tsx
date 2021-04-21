import { AppState, actions, selectors } from "features";
import { NDX_ADDRESS, WETH_CONTRACT_ADDRESS } from "config";
import { PortfolioCard } from "components";
import { Space, Typography } from "antd";
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

export function Portfolio() {
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
          <div
            style={{
              position: "fixed",
              top: 75,
              left: 0,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              zIndex: 1,
              paddingRight: "12vw",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(0,0,0,0.75)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                padding: 12,
              }}
            >
              <Typography.Text
                style={{
                  textTransform: "uppercase",
                  textAlign: "right",
                  fontSize: 24,
                }}
              >
                <Typography.Text type="secondary" style={{ marginRight: 24 }}>
                  {tx("TOTAL_VALUE")}{" "}
                </Typography.Text>
                <Typography.Text type="success">
                  {formattedPortfolio.totalValue}
                </Typography.Text>
              </Typography.Text>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
