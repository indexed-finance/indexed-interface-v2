import { Button, Divider, Space, Typography } from "antd";
import { FaCoins, FaFireAlt, FaHammer, FaTractor } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import noop from "lodash.noop";

export function PoolInteractionFooter({ pool }: { pool: FormattedIndexPool }) {
  return (
    <Space
      style={{
        width: "100%",
        justifyContent: "flex-end",
        margin: "0 8rem",
      }}
    >
      <Typography.Title level={4} type="secondary" style={{ margin: 0 }}>
        Interact with {pool.name}
      </Typography.Title>
      <Divider type="vertical" />
      <div style={{ flex: 1 }}>
        {[
          {
            title: "Trade",
            icon: <FaCoins />,
            onClick: noop,
          },
          {
            title: "Mint",
            icon: <FaHammer />,
            onClick: noop,
          },
          {
            title: "Burn",
            icon: <FaFireAlt />,
            onClick: noop,
          },
          {
            title: "Stake",
            icon: <FaTractor />,
            onClick: noop,
          },
        ].map((link) => {
          const inner = (
            <Typography.Title level={4}>
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
