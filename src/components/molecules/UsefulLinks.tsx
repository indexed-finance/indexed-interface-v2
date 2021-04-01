import { Menu, Space } from "antd";
import { useMemo } from "react";
import { usePoolQuickswapLink } from "hooks";
import { useTranslator } from "hooks";
import type { TranslatedTerm } from "helpers";

const USEFUL_LINKS: Array<{
  text: TranslatedTerm;
  image: string;
  makeLink(address: string): string;
}> = [
  {
    text: "VIEW_ON_ETHERSCAN",
    image: require("assets/images/etherscan-link.png").default,
    makeLink: (address) =>
      `https://etherscan.io/address/${address.toLowerCase()}#code`,
  },
  {
    text: "TRADE_WITH_UNISWAP",
    image: require("assets/images/uniswap-link.png").default,
    makeLink: (address) =>
      `https://info.uniswap.org/token/${address.toLowerCase()}`,
  },
];

export function UsefulLinks({ address }: { address: string }) {
  const tx = useTranslator();
  const quickswapLink = usePoolQuickswapLink(address);
  const links = useMemo(
    () =>
      quickswapLink
        ? USEFUL_LINKS.concat({
            text: "SWAP_WITH_QUICKSWAP",
            image: require("assets/images/quickswap.png").default,
            makeLink: (_) => quickswapLink,
          })
        : USEFUL_LINKS,
    [quickswapLink]
  );

  return (
    <Menu mode="horizontal" selectable={false}>
      {links.map(({ text, image, makeLink }) => (
        <Menu.Item key={image}>
          <Space>
            <a
              key={image}
              href={makeLink(address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="..."
                src={image}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 12,
                  position: "relative",
                  top: -2,
                }}
              />
              <span>{tx(text)}</span>
            </a>
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );
}
