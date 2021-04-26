import { Button, Card, Divider, Space } from "antd";
import { ExternalLink } from "components/atomic";
import { FormattedIndexPool } from "features";
import { Fragment, useMemo } from "react";
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
    image: require("images/etherscan-link.png").default,
    makeLink: (address) =>
      `https://etherscan.io/address/${address.toLowerCase()}#code`,
  },
  {
    text: "TRADE_WITH_UNISWAP",
    image: require("images/uniswap-link.png").default,
    makeLink: (address) =>
      `https://info.uniswap.org/token/${address.toLowerCase()}`,
  },
];

export function IndexPoolExternalLinks({ id }: FormattedIndexPool) {
  const tx = useTranslator();
  const quickswapLink = usePoolQuickswapLink(id);
  const links = useMemo(
    () =>
      quickswapLink
        ? USEFUL_LINKS.concat({
            text: "SWAP_WITH_QUICKSWAP",
            image: require("images/quickswap.png").default,
            makeLink: (_) => quickswapLink,
          })
        : USEFUL_LINKS,
    [quickswapLink]
  );

  return (
    <Card>
      {links.map(({ text, image, makeLink }, index) => (
        <Fragment key={text}>
          <Button
            type="text"
            block={true}
            style={{
              padding: "0 40px",
            }}
          >
            <ExternalLink to={makeLink(id)}>
              <Space
                style={{
                  display: "flex",
                  padding: "0 12px",
                }}
              >
                <img
                  alt="..."
                  src={image}
                  style={{
                    flex: 1,
                    width: 24,
                    height: 24,
                    marginRight: 12,
                    position: "relative",
                    top: -2,
                  }}
                />
                <span style={{ flex: 1, fontSize: 16 }}>{tx(text)}</span>
              </Space>
            </ExternalLink>
          </Button>
          {index !== links.length - 1 && <Divider style={{ margin: 6 }} />}
        </Fragment>
      ))}
    </Card>
  );
}
