import { Button, Space, Statistic } from "antd";
import { IndexCard } from "components";
import { Link } from "react-router-dom";
import { useBreakpoints } from "helpers";
import Subscreen from "./Subscreen";
import type { FormattedStakingData } from "features";

export default function Staking({
  title,
  data,
}: {
  title: string;
  data: FormattedStakingData[];
}) {
  const { isMobile } = useBreakpoints();

  return (
    <Subscreen title={title}>
      <div style={{ padding: 30 }}>
        {data.map((datum) => {
          const commonActions = [
            {
              title: "Rate",
              value: datum.rate,
            },
            {
              title: "Total",
              value: datum.earned,
            },
          ];
          const actions = isMobile
            ? [
                {
                  title: "APY",
                  value: datum.apy,
                },
                {
                  title: "Staked",
                  value: datum.staked,
                },
                ...commonActions,
              ]
            : commonActions;

          return (
            <IndexCard
              style={{
                marginBottom: 15,
                width: 545,
                maxWidth: "100%",
              }}
              titleStyle={{
                fontSize: 22,
              }}
              direction={isMobile ? "vertical" : "horizontal"}
              title={
                datum.isWethPair ? (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://info.uniswap.org/pair/${datum.stakingToken.toLowerCase()}`}
                  >
                    Uniswap V2 Pair for ETH-{datum.symbol}
                  </a>
                ) : (
                  <Link to={`/pools/${datum.slug}`}>{datum.name}</Link>
                )
              }
              subtitle={datum.symbol}
              actions={actions}
              centered={false}
              key={datum.id}
            >
              {!isMobile && (
                <Space
                  style={{ width: "100%", justifyContent: "space-evenly" }}
                >
                  <Statistic title="APY" value={datum.apy} />
                  <Statistic title="Staked" value={datum.staked} />
                  <Button
                    type="primary"
                    style={{ minWidth: 200, justifySelf: "center" }}
                  >
                    Stake pool
                  </Button>
                </Space>
              )}
            </IndexCard>
          );
        })}
      </div>
    </Subscreen>
  );
}
