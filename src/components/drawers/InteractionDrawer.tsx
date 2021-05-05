import { AppState, selectors } from "features";
import { BiCoin } from "react-icons/bi";
import {
  BurnInteraction,
  MintInteraction,
  StakeInteraction,
  TradeInteraction,
} from "components/interactions";
import { Card, Col, Drawer, Menu, Row, Typography } from "antd";
import { FaCoins, FaFireAlt, FaTractor } from "react-icons/fa";
import { useBreakpoints, useStakingApy } from "hooks";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDrawer } from "./Drawer";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import S from "string";

export type IndexPoolInteraction =
  | "burn"
  | "uniswapBurn"
  | "multiBurn"
  | "mint"
  | "uniswapMint"
  | "multiMint"
  | "trade"
  | "stake";

export function useInteractionDrawer(indexPool: string) {
  const { open: baseOpen } = useDrawer();
  const open = useCallback(
    (interaction: IndexPoolInteraction) =>
      baseOpen(
        <InteractionDrawer
          indexPoolAddress={indexPool}
          activeInteraction={interaction}
        />
      ),
    [baseOpen, indexPool]
  );

  return { open };
}

export function InteractionDrawer({
  indexPoolAddress,
  activeInteraction,
}: {
  indexPoolAddress: string;
  activeInteraction: IndexPoolInteraction;
}) {
  const { pathname } = useLocation();
  const previousLocation = useRef(pathname);
  const { isMobile } = useBreakpoints();
  const { active, close } = useDrawer();
  const { open } = useInteractionDrawer(indexPoolAddress);
  const formattedIndexPool = useSelector((state: AppState) =>
    selectors.selectFormattedIndexPool(state, indexPoolAddress)
  );
  const interaction = useMemo(() => {
    if (formattedIndexPool) {
      switch (activeInteraction) {
        case "trade":
          return <TradeInteraction indexPool={formattedIndexPool} />;
        case "mint":
          return <MintInteraction indexPool={formattedIndexPool} />;
        case "uniswapMint":
          return (
            <MintInteraction indexPool={formattedIndexPool} uniswap={true} />
          );
        case "multiMint":
          return (
            <MintInteraction indexPool={formattedIndexPool} multi={true} />
          );
        case "burn":
          return <BurnInteraction indexPool={formattedIndexPool} />;
        case "uniswapBurn":
          return (
            <BurnInteraction indexPool={formattedIndexPool} uniswap={true} />
          );
        case "multiBurn":
          return (
            <BurnInteraction indexPool={formattedIndexPool} multi={true} />
          );
        case "stake":
          return <StakeInteraction indexPool={formattedIndexPool} />;
        default:
          return null;
      }
    } else {
      return null;
    }
  }, [formattedIndexPool, activeInteraction]);
  const selectedKeys = useMemo(() => {
    const lowered = activeInteraction.toLowerCase();

    if (lowered === "trade") {
      return ["trade"];
    } else if (lowered.includes("mint")) {
      return ["mintGroup", activeInteraction];
    } else if (lowered.includes("burn")) {
      return ["burnGroup", activeInteraction];
    } else if (lowered === "stake") {
      return ["stake"];
    }
  }, [activeInteraction]);
  const stakingApy = useStakingApy(indexPoolAddress);

  useEffect(() => {
    if (pathname !== previousLocation.current) {
      previousLocation.current = pathname;
      close();
    }
  });

  return (
    <Drawer
      mask={false}
      visible={Boolean(active)}
      onClose={close}
      placement="bottom"
      style={{
        justifyContent: "center",
        display: "flex",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: 0,
        overflow: "hidden",
        borderRadius: 25,
      }}
      contentWrapperStyle={{
        borderTop: "1px solid rgba(255, 255, 255, 0.35)",
        borderRight: "1px solid rgba(255, 255, 255, 0.15)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
        maxWidth: 1200,
        width: isMobile ? "96vw" : "80vw",
        overflow: "hidden",
      }}
      height={333}
    >
      <Row gutter={0} align="stretch">
        <Col span={6}>
          <Menu
            mode="inline"
            openKeys={["mintGroup", "burnGroup"]}
            expandIcon={() => null}
            selectedKeys={selectedKeys}
            style={{
              fontSize: 20,
            }}
          >
            <Menu.Item
              key="trade"
              icon={<FaCoins />}
              onClick={() => open("trade")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Trade
            </Menu.Item>
            <Menu.Divider />
            <Menu.SubMenu
              key="mintGroup"
              title={<Typography.Text type="secondary">Mint</Typography.Text>}
              onTitleClick={() => open("mint")}
            >
              <Menu.Item
                key="mint"
                onClick={() => open("mint")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <BiCoin />
                <span>Single</span>
              </Menu.Item>
              <Menu.Item
                key="multiMint"
                onClick={() => open("multiMint")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <div>
                  <BiCoin />
                  <BiCoin
                    style={{ position: "relative", left: -8, opacity: 0.6 }}
                  />
                  <BiCoin
                    style={{ position: "relative", left: -16, opacity: 0.3 }}
                  />
                </div>
                <span>Multi</span>
              </Menu.Item>
              <Menu.Item
                key="uniswapMint"
                onClick={() => open("uniswapMint")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <img
                  alt="Uniswap"
                  src={require("images/uniswap-link.png").default}
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />{" "}
                <span>Uniswap</span>
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu
              key="burnGroup"
              style={{ justifyContent: "flex-start" }}
              title={<Typography.Text type="secondary">Burn</Typography.Text>}
              onTitleClick={() => open("burn")}
            >
              <Menu.Item
                key="burn"
                onClick={() => open("burn")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <FaFireAlt />
                <span>Single</span>
              </Menu.Item>
              <Menu.Item
                key="multiBurn"
                onClick={() => open("multiBurn")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <div>
                  <FaFireAlt />
                  <FaFireAlt
                    style={{ position: "relative", left: -8, opacity: 0.6 }}
                  />
                  <FaFireAlt
                    style={{ position: "relative", left: -16, opacity: 0.3 }}
                  />
                </div>
                <span>Multi</span>
              </Menu.Item>
              <Menu.Item
                key="uniswapBurn"
                onClick={() => open("uniswapBurn")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 16,
                }}
              >
                <img
                  alt="Uniswap"
                  src={require("images/uniswap-link.png").default}
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />{" "}
                <span>Uniswap</span>
              </Menu.Item>
            </Menu.SubMenu>
            {stakingApy && stakingApy !== "Expired" && (
              <>
                <Menu.Divider />{" "}
                <Menu.Item
                  key="stake"
                  icon={<FaTractor />}
                  onClick={() => open("stake")}
                  disabled={false}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Stake
                </Menu.Item>
              </>
            )}
          </Menu>
        </Col>
        <Col span={18}>
          <Card
            bordered={false}
            style={{ borderRadius: 0 }}
            bodyStyle={{ overflow: "hidden" }}
            title={
              <Typography.Title level={3} style={{ margin: 0 }}>
                {S(activeInteraction).humanize().s}
              </Typography.Title>
            }
          >
            {interaction}
          </Card>
        </Col>
      </Row>
    </Drawer>
  );
}
