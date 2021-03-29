import { Button, Space, Statistic } from "antd";
import { IndexCard } from "components/molecules";
import { Link } from "react-router-dom";
import { useBreakpoints } from "helpers";
import { useStakingApy } from "hooks/use-staking-apy";
import { useTranslation } from "i18n";
import type { FormattedStakingData } from "features";

export default function StakingCard(props: FormattedStakingData) {
  const tx = useTranslation();
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
  const apy = useStakingApy(id);
  const isExpired = apy === "Expired";
  const commonActions = [
    {
      title: tx("RATE"),
      value: rate,
    },
    {
      title: tx("EARNED"),
      value: earned,
    },
  ];
  const actions = isMobile
    ? [
        {
          title: tx("APY"),
          value: apy,
        },
        {
          title: tx("STAKED"),
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
          <Statistic
            title={tx("APY")}
            valueStyle={{
              color: apy === "Expired" ? "grey" : "",
            }}
            value={apy ?? ""}
          />
          <Statistic title={tx("STAKED")} value={staked} />
          <Button
            type="primary"
            disabled={isExpired}
            style={{ minWidth: 200, justifySelf: "center" }}
          >
            {isExpired ? tx("STAKING_EXPIRED") : tx("STAKE_POOL")}
          </Button>
        </Space>
      )}
    </IndexCard>
  );
}
