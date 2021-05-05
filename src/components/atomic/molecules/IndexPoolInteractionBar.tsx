import { Button, Divider, Space, Typography } from "antd";
import { FaCoins, FaFireAlt, FaHammer, FaTractor } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import { Token } from "components/atomic";
import { useInteractionDrawer } from "components/drawers";
import { useMemo } from "react";

export function useIndexPoolInteractions(indexPoolAddress: string) {
  const { open } = useInteractionDrawer(indexPoolAddress);

  return useMemo(
    () => [
      {
        title: "Trade",
        icon: <FaCoins />,
        onClick: () => open("trade"),
      },
      {
        title: "Mint",
        icon: <FaHammer />,
        onClick: () => open("mint"),
      },
      {
        title: "Burn",
        icon: <FaFireAlt />,
        onClick: () => open("burn"),
      },
      {
        title: "Stake",
        icon: <FaTractor />,
        onClick: () => open("stake"),
      },
    ],
    [open]
  );
}

export function IndexPoolInteractionBar({
  indexPool,
}: {
  indexPool: FormattedIndexPool;
}) {
  const indexPoolInteractions = useIndexPoolInteractions(indexPool.id);

  return (
    <Space
      style={{
        width: "100%",
        justifyContent: "flex-end",
        margin: "0 8rem",
      }}
    >
      <Typography.Title level={4} type="secondary" style={{ margin: 0 }}>
        Interact with{" "}
        <Token
          name={indexPool.name}
          address={indexPool.id}
          symbol={indexPool.symbol}
        />
      </Typography.Title>
      <Divider type="vertical" />
      <div style={{ flex: 1 }}>
        {indexPoolInteractions.map((link) => {
          const inner = (
            <Typography.Title level={4} onClick={link.onClick}>
              <Space>
                <span style={{ position: "relative", top: 3 }}>
                  {link.icon}
                </span>
                <span>{link.title}</span>
              </Space>
            </Typography.Title>
          );

          return (
            <Button
              key={link.title}
              size="large"
              type="text"
              style={{ textTransform: "uppercase" }}
            >
              {inner}
            </Button>
          );
        })}
      </div>
    </Space>
  );
}
