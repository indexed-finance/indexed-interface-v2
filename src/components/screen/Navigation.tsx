import { AiOutlineUser } from "react-icons/ai";
import { Button, Space, Typography } from "antd";
import { FaEthereum, FaGavel, FaSwimmingPool } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useTranslator } from "hooks";

export function Navigation() {
  const tx = useTranslator();
  const { pathname } = useLocation();

  return (
    <Space
      style={{
        justifyContent: "space-evenly",
        width: "100%",
        height: "100%",
      }}
    >
      {[
        {
          key: "portfolio",
          title: tx("PORTFOLIO"),
          icon: <AiOutlineUser />,
          path: "/portfolio",
        },
        {
          key: "staking",
          title: tx("STAKE"),
          icon: <FaEthereum />,
          path: "/staking",
        },
        {
          key: "index-pools",
          title: tx("INDEX_POOLS"),
          icon: <FaSwimmingPool />,
          path: "/index-pools",
        },
        {
          key: "govern",
          title: "GOVERN",
          icon: <FaGavel />,
          path: "https://vote.indexed.finance/",
        },
      ].map((link) => {
        const isActive = pathname.includes(link.key);
        const inner = (
          <Typography.Title level={3}>
            <Space
              style={{
                color: isActive ? "#FB1ECD" : "rgba(255,255,255,0.85)",
              }}
            >
              <span style={{ position: "relative", top: 3 }}>{link.icon}</span>
              <span>{link.title}</span>
            </Space>
          </Typography.Title>
        );

        return (
          <Button
            key={link.key}
            size="large"
            type="text"
            style={{
              textTransform: "uppercase",
              padding: "6px 10px",
              height: "auto",
              borderLeft: isActive ? "2px solid #FB1ECD" : "none",
            }}
          >
            {link.path.includes("://") ? (
              <a
                style={{ position: "relative", top: 4 }}
                href={link.path}
                rel="noopener noreferrer"
                target="_blank"
              >
                {inner}
              </a>
            ) : (
              <Link style={{ position: "relative", top: 4 }} to={link.path}>
                {inner}
              </Link>
            )}
          </Button>
        );
      })}
    </Space>
  );
}
