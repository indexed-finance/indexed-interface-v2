import { AiOutlineUser } from "react-icons/ai";
import { ExternalLink } from "components/atomic/atoms";
import { FEATURE_FLAGS } from "feature-flags";
import { FaGavel, FaSwimmingPool } from "react-icons/fa";
import { FaListUl } from "react-icons/fa";
import { GoLightBulb } from "react-icons/go";
import { Link, useLocation } from "react-router-dom";
import { Menu, Space } from "antd";
import { RiSafe2Line } from "react-icons/ri";
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
      <Menu.SubMenu
        title="Products"
        icon={<FaListUl style={{ position: "relative", top: -2, left: -20 }} />}
      >
        <Menu.Item key="vaults">
          <Link to="/vaults">
            <Space size="small">
              <RiSafe2Line style={{ position: "relative", top: 2 }} />{" "}
              {!isMobile && <span>Vaults</span>}
            </Space>
          </Link>
        </Menu.Item>
        <Menu.Item key="index-pools">
          <Link to="/index-pools">
            <Space size="small">
              <FaSwimmingPool style={{ position: "relative", top: 2 }} />{" "}
              {!isMobile && <span>Indexes</span>}
            </Space>
          </Link>
        </Menu.Item>
        <Menu.Item key="staking">
          <Link to="/staking">
            <Space>
              <RiSafe2Line style={{ position: "relative", top: 2 }} />{" "}
              {!isMobile && <span>Staking</span>}
            </Space>
          </Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="portfolio">
        <Link to="/portfolio">
          <Space size="small">
            <AiOutlineUser style={{ position: "relative", top: 2 }} />{" "}
            {!isMobile && <span>{tx("PORTFOLIO")}</span>}
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <ExternalLink
          to="https://legacy.indexed.finance/governance"
          withIcon={false}
        >
          <Space size="small">
            <FaGavel style={{ position: "relative", top: 2 }} />{" "}
            {!isMobile && <span>Vote</span>}
          </Space>
        </ExternalLink>
      </Menu.Item>
      {FEATURE_FLAGS.useAcademy && (
        <Menu.Item key="learn">
          <Link to="/learn">
            <Space>
              <GoLightBulb style={{ position: "relative", top: 2 }} />{" "}
              {!isMobile && <span>Learn</span>}
            </Space>
          </Link>
        </Menu.Item>
      )}
    </Menu>
  );
}
