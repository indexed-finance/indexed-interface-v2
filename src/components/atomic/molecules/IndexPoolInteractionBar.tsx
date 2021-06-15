import { AppState, FormattedIndexPool, selectors } from "features";
import { BiCoin } from "react-icons/bi";
import { Button, Space, Typography } from "antd";
import { FaCoins, FaFireAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useIndexPoolInteractions(indexPoolAddress: string) {
  const formattedPool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, indexPoolAddress)
  );
  const slug = formattedPool?.slug ?? "";

  return useMemo(() => {
    const baseInteractions = [
      {
        title: "Buy",
        link: `${slug}/buy`,
        icon: <FaCoins />,
      },
      {
        title: "Mint",
        link: `${slug}/mint`,
        icon: <BiCoin />,
      },
      {
        title: "Burn",
        link: `${slug}/burn`,
        icon: <FaFireAlt />,
      },
    ];

    return baseInteractions;
  }, [slug]);
}

export function IndexPoolInteractionBar({
  indexPool,
}: {
  indexPool: FormattedIndexPool;
}) {
  const indexPoolInteractions = useIndexPoolInteractions(indexPool.id);

  return (
    <Button.Group>
      {indexPoolInteractions.map((interaction, index, array) => (
        <Link
          key={interaction.title}
          to={{
            pathname: interaction.link,
            state: {
              indexPool,
            },
          }}
        >
          <Button
            size="large"
            style={{ marginRight: index === array.length - 1 ? 0 : 12 }}
          >
            <Typography.Title level={4}>
              <Space>
                <span style={{ position: "relative", top: 3 }}>
                  {interaction.icon}
                </span>
                <span>{interaction.title}</span>
              </Space>
            </Typography.Title>
          </Button>
        </Link>
      ))}
    </Button.Group>
  );
}
