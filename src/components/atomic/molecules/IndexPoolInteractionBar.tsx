import { BiCoin } from "react-icons/bi";
import { Button, Space, Typography } from "antd";
import { FaCoins, FaFireAlt, FaTractor } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import { useInteractionDrawer } from "components/drawers";
import { useMemo } from "react";
import { useStakingApy } from "hooks";

export function useIndexPoolInteractions(indexPoolAddress: string) {
  const { open } = useInteractionDrawer(indexPoolAddress);
  const stakingApy = useStakingApy(indexPoolAddress);

  return useMemo(() => {
    const baseInteractions = [
      {
        title: "Buy",
        icon: <FaCoins />,
        onClick: () => open("trade"),
      },
      {
        title: "Mint",
        icon: <BiCoin />,
        onClick: () => open("mint"),
      },
      {
        title: "Burn",
        icon: <FaFireAlt />,
        onClick: () => open("burn"),
      },
    ];

    if (stakingApy && stakingApy !== "Expired") {
      baseInteractions.push({
        title: "Stake",
        icon: <FaTractor />,
        onClick: () => open("stake"),
      });
    }

    return baseInteractions;
  }, [open, stakingApy]);
}

export function IndexPoolInteractionBar({
  indexPool,
}: {
  indexPool: FormattedIndexPool;
}) {
  const indexPoolInteractions = useIndexPoolInteractions(indexPool.id);

  return (
    <Button.Group style={{ width: "100%", marginBottom: 24 }}>
      {indexPoolInteractions.map((interaction) => (
        <Button key={interaction.title} size="large" block={true}>
          <Typography.Title level={4} onClick={interaction.onClick}>
            <Space>
              <span style={{ position: "relative", top: 3 }}>
                {interaction.icon}
              </span>
              <span>{interaction.title}</span>
            </Space>
          </Typography.Title>
        </Button>
      ))}
    </Button.Group>
  );
}
