import { BiCoin } from "react-icons/bi";
import {
  BurnInteraction,
  MintInteraction,
  TradeInteraction,
} from "components/interactions";
import { Button, Menu, Space, Typography } from "antd";
import { FaCoins, FaFireAlt } from "react-icons/fa";
import { FormattedIndexPool } from "features";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useFormattedIndexPool } from "hooks";

export function useIndexPoolInteractions(indexPoolAddress: string) {
  const formattedPool = useFormattedIndexPool(indexPoolAddress)
  const slug = formattedPool?.slug ?? "";

  return useMemo(() => {
    const baseInteractions = [
      {
        title: "Buy",
        link: `${slug}/buy`,
        icon: <FaCoins />,
      },
    ];

    const symbol = formattedPool?.symbol ?? "";

    if (symbol !== "CC10" && symbol !== "DEFI5" && symbol !== "FFF") {
      baseInteractions.push({
        title: "Mint",
        link: `${slug}/mint`,
        icon: <BiCoin />,
      });
    }

    baseInteractions.push({
      title: "Burn",
      link: `${slug}/burn`,
      icon: <FaFireAlt />,
    });

    return baseInteractions;
  }, [slug, formattedPool]);
}

export function IndexPoolInteractionBar({
  indexPool,
  onChange,
}: {
  indexPool: FormattedIndexPool;
  onChange(content: ReactNode, title: "buy" | "mint" | "burn"): void;
}) {
  const indexPoolInteractions = useIndexPoolInteractions(indexPool.id);
  const [activeTitle, setActiveTitle] = useState("");
  const [activeKey, setActiveKey] = useState<"router" | "single" | "multi">(
    "router"
  );
  const updateContent = useCallback(() => {
    let content: ReactNode;

    if (activeTitle === "Buy") {
      content = (
        <>
          <Typography.Title level={2}>Buy {indexPool.symbol}</Typography.Title>
          <TradeInteraction indexPool={indexPool} />
        </>
      );
    } else if (activeTitle === "Mint") {
      content = (
        <Space direction="vertical" style={{ marginBottom: 24, width: "100%" }}>
          <Typography.Title level={2}>Mint {indexPool.symbol}</Typography.Title>
          <Menu
            mode="horizontal"
            style={{ marginLeft: -12 }}
            activeKey={activeKey}
            selectedKeys={[activeKey]}
            defaultActiveFirst={true}
          >
            <Menu.Item key="router" onClick={() => setActiveKey("router")}>Router</Menu.Item>
            <Menu.Item key="single" onClick={() => setActiveKey("single")}>Single</Menu.Item>
            <Menu.Item key="multi" onClick={() => setActiveKey("multi")}>Multi</Menu.Item>
          </Menu>
          {activeKey === "router" && (
            <MintInteraction indexPool={indexPool} uniswap={true} />
          )}
          {activeKey === "single" && <MintInteraction indexPool={indexPool} />}
          {activeKey === "multi" && (
            <MintInteraction indexPool={indexPool} multi={true} />
          )}
        </Space>
      );
    } else if (activeTitle === "Burn")
      content = (
        <Space direction="vertical" style={{ marginBottom: 24, width: "100%" }}>
          <Typography.Title level={2}>Burn {indexPool.symbol}</Typography.Title>
          <Menu
            mode="horizontal"
            style={{ marginLeft: -12 }}
            activeKey={activeKey}
            selectedKeys={[activeKey]}
            defaultActiveFirst={true}
          >
            <Menu.Item key="router" onClick={() => setActiveKey("router")}>Router</Menu.Item>
            <Menu.Item key="single" onClick={() => setActiveKey("single")}>Single</Menu.Item>
            <Menu.Item key="multi" onClick={() => setActiveKey("multi")}>Multi</Menu.Item>
          </Menu>
          {activeKey === "router" && (
            <BurnInteraction indexPool={indexPool} uniswap={true} />
          )}
          {activeKey === "single" && <BurnInteraction indexPool={indexPool} />}
          {activeKey === "multi" && (
            <BurnInteraction indexPool={indexPool} multi={true} />
          )}
        </Space>
      );

    onChange(content, activeTitle.toLowerCase() as "buy" | "mint" | "burn");
  }, [activeKey, activeTitle, indexPool, onChange]);

  useEffect(() => {
    if (activeKey) {
      updateContent();
    }
  }, [activeKey, updateContent]);

  return (
    <>
      <Button.Group>
        {indexPoolInteractions.map((interaction, index, array) => {
          const isActive = activeTitle === interaction.title;

          return (
            <Button
              key={index}
              size="large"
              type={isActive ? "primary" : "default"}
              style={{ marginRight: index === array.length - 1 ? 0 : 12 }}
              onClick={() => {
                setActiveTitle(
                  activeTitle === interaction.title ? "" : interaction.title
                );
                updateContent();
              }}
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
          );
        })}
      </Button.Group>
    </>
  );
}
