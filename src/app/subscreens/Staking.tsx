import { Button, Space, Statistic } from "antd";
import { IndexCard } from "components";
import { Link } from "react-router-dom";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useEthPrice } from "hooks";
import { useSelector } from "react-redux";
import Subscreen from "./Subscreen";
import type { AppState, FormattedStakingData } from "features";

function StakingCard(props: FormattedStakingData) {
  const {
    id,
    rate,
    earned,
    symbol,
    isWethPair,
    staked,
    stakingToken,
    slug,
    name,
  } = props;
  const { isMobile } = useBreakpoints();
  const ethPrice = useEthPrice();
  const apy = useSelector((state: AppState) =>
    selectors.selectStakingApy(state, id, ethPrice)
  );

  const commonActions = [
    {
      title: "Rate",
      value: rate,
    },
    {
      title: "Total",
      value: earned,
    },
  ];
  const actions = isMobile
    ? [
        {
          title: "APY",
          value: apy,
        },
        {
          title: "Staked",
          value: staked,
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
        isWethPair ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://info.uniswap.org/pair/${stakingToken.toLowerCase()}`}
          >
            Uniswap V2 Pair for ETH-{symbol}
          </a>
        ) : (
          <Link to={`/pools/${slug}`}>{name}</Link>
        )
      }
      subtitle={symbol}
      actions={actions}
      centered={false}
    >
      {!isMobile && (
        <Space style={{ width: "100%", justifyContent: "space-evenly" }}>
          <Statistic title="APY" value={apy ?? ""} />
          <Statistic title="Staked" value={staked} />
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
}

export default function Staking({
  title,
  data,
}: {
  title: string;
  data: FormattedStakingData[];
}) {
  return (
    <Subscreen title={title}>
      <div style={{ padding: 30 }}>
        {data.map((datum) => (
          <StakingCard key={datum.id} {...datum} />
        ))}
      </div>
    </Subscreen>
  );
}
