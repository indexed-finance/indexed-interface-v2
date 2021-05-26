import { AiOutlineUser } from "react-icons/ai";
import { Button, Menu, Space, Typography } from "antd";
import { ExternalLink } from "components/atomic";
import { FaEthereum, FaGavel, FaSwimmingPool } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useBreakpoints, useTranslator } from "hooks";
import { useMemo } from "react";

export function Navigation() {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();
  const { pathname } = useLocation();
  const selectedKey = useMemo(() => {
    for (const link of ["portfolio", "staking", "index-pools"]) {
      if (pathname.includes(link)) {
        return link;
      }
    }

    return "";
  }, [pathname]);

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[selectedKey]}
      style={{
        flex: 1,
        textTransform: "uppercase",
        fontSize: 21,
        background: "transparent",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      <Menu.Item key="index-pools">
        <Link to="/index-pools">
          <Space size="small">
            <FaSwimmingPool style={{ position: "relative", top: 2 }} />{" "}
            {!isMobile && <span>{tx("INDEX_POOLS")}</span>}
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item key="portfolio">
        <Link to="/portfolio">
          <Space size="small">
            <AiOutlineUser style={{ position: "relative", top: 2 }} />{" "}
            {!isMobile && <span>{tx("PORTFOLIO")}</span>}
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item key="staking">
        <Link to="/staking">
          <Space>
            <FaEthereum style={{ position: "relative", top: 2 }} />{" "}
            {!isMobile && <span>{tx("STAKE")}</span>}
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <ExternalLink to="https://vote.indexed.finance/" withIcon={false}>
          <Space size="small">
            <FaGavel style={{ position: "relative", top: 2 }} />{" "}
            {!isMobile && <span>Govern</span>}
          </Space>
        </ExternalLink>
      </Menu.Item>
    </Menu>
  );

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
          path: "",
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
