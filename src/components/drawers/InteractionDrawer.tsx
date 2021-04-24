import { AppState, selectors } from "features";
import { BaseDrawer, useDrawer } from "./Drawer";
import {
  BurnInteraction,
  MintInteraction,
  TradeInteraction,
} from "components/interactions";
import { Col, Menu, Row, Spin } from "antd";
import { FaCoins, FaFireAlt, FaHammer } from "react-icons/fa";
import { Token } from "components/atomic";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

export type IndexPoolInteraction =
  | "burn"
  | "uniswapBurn"
  | "multiBurn"
  | "mint"
  | "uniswapMint"
  | "multiMint"
  | "trade";

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
  const { close } = useDrawer();
  const { open } = useInteractionDrawer(indexPoolAddress);
  const indexPool = useSelector((state: AppState) =>
    selectors.selectPool(state, indexPoolAddress)
  );
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
    }
  }, [activeInteraction]);

  return (
    <BaseDrawer
      width={550}
      top={105}
      title={
        indexPool ? (
          <>
            Interact with{" "}
            <Token
              name={indexPool.name}
              image=""
              address={indexPool.id}
              symbol={indexPool.symbol}
            />
          </>
        ) : (
          <Spin />
        )
      }
      onClose={close}
      closable={true}
      bodyStyle={{
        position: "relative",
      }}
    >
      <Row gutter={18}>
        <Col span={8}>
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
              title="Mint"
              icon={<FaHammer />}
              onTitleClick={() => open("mint")}
            >
              <Menu.Item key="mint" onClick={() => open("mint")}>
                Single
              </Menu.Item>
              <Menu.Item key="multiMint" onClick={() => open("multiMint")}>
                Multi
              </Menu.Item>
              <Menu.Item key="uniswapMint" onClick={() => open("uniswapMint")}>
                Uniswap
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.Divider />
            <Menu.SubMenu
              key="burnGroup"
              title="Burn"
              icon={<FaFireAlt />}
              onTitleClick={() => open("burn")}
            >
              <Menu.Item key="burn" onClick={() => open("burn")}>
                Single
              </Menu.Item>
              <Menu.Item key="multiBurn" onClick={() => open("multiBurn")}>
                Multi
              </Menu.Item>
              <Menu.Item key="uniswapBurn" onClick={() => open("uniswapBurn")}>
                Uniswap
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.Divider />
          </Menu>
        </Col>
        <Col span={16}>{interaction}</Col>
      </Row>
    </BaseDrawer>
  );
}
