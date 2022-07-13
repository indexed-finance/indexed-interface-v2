import { AiOutlineUser } from "react-icons/ai";
import { ExternalLink } from "components/atomic/atoms";
import { FEATURE_FLAGS } from "feature-flags";
import { FaGavel, FaListUl, FaSwimmingPool } from "react-icons/fa";
import { GoLightBulb } from "react-icons/go";
import { Link, useLocation } from "react-router-dom";
import { Menu, Space } from "antd";
import { NETWORKS, SUPPORTED_NETWORKS } from "../../../config/network";
import { RiSafe2Line } from "react-icons/ri";
import {
  useBreakpoints,
  useChainId,
  useRequestChangeNetworkCallback,
  useTranslator,
} from "hooks";
import { useMemo } from "react";
import Icon from "@ant-design/icons";

const NETWORKS_BY_ID: Record<number, any> = {
  1: NETWORKS.mainnet,
  137: NETWORKS.polygon,
};

function NetworkIcon({ chainId }: { chainId: number }) {
  return (
    <img
      style={{ height: "2em" }}
      src={require(`images/${NETWORKS_BY_ID[chainId].icon}`).default}
    />
  );
}

// const MaticIcon = () => <img src={MaticIconSvg} />;
// const NetworkIcon = (chainId: number) => <img style={{ height: '2em'}} src={require(`images/${NETWORKS_BY_ID[chainId].icon}`).default} />

export function Navigation() {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();
  const { pathname } = useLocation();
  const chainId = useChainId();
  const requestChangeNetwork = useRequestChangeNetworkCallback();

  const selectedKey = useMemo(() => {
    for (const link of ["index-pools"]) {
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
        <Menu.Item key="index-pools">
          <Link to="/index-pools">
            <Space size="small">
              <FaSwimmingPool style={{ position: "relative", top: 2 }} />{" "}
              {!isMobile && <span>Indexes</span>}
            </Space>
          </Link>
        </Menu.Item>
        <Menu.Item key="timelocks">
          <Link to="/timelocks">
            <Space size="small">
              <RiSafe2Line style={{ position: "relative", top: 2 }} />{" "}
              {!isMobile && <span>Timelocks</span>}
            </Space>
          </Link>
        </Menu.Item>
      </Menu.SubMenu>

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
      <Menu.SubMenu
        title={NETWORKS_BY_ID[chainId].name}
        icon={
          <Icon
            component={() => <NetworkIcon chainId={chainId} />}
            style={{ position: "relative", top: -2, left: -10 }}
          />
        }
      >
        {SUPPORTED_NETWORKS.filter((n) => n !== chainId).map((id) => {
          const { name } = NETWORKS_BY_ID[id];
          return (
            <Menu.Item
              key={`${name}-network`}
              onClick={() => requestChangeNetwork(id)}
            >
              {/* <Link to="/index-pools"> */}
              <Space size="large">
                <Icon
                  component={() => <NetworkIcon chainId={id} />}
                  style={{ position: "relative", top: -4 }}
                />
                <span style={{ textTransform: "uppercase", fontSize: 20 }}>
                  {name}
                </span>
              </Space>
              {/* </Link> */}
            </Menu.Item>
          );
        })}
        {/*  <Menu.Item key="eth-network">
          <Link to="/index-pools">
            <Space size="large">
              <Icon component={MaticIcon} style={{ position: "relative", top: -4 }}  />{" "}
              <span style={{ fontSize: 20 }}>Ethereum</span>
            </Space>
          </Link>
        </Menu.Item> */}
        {/* <Menu.Item key="matic-network">
          <Space size="small">
            <Icon src={MaticIcon} style={{ position: "relative", top: 2 }} />{" "} Polygon
          </Space>
        </Menu.Item> */}
      </Menu.SubMenu>
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
