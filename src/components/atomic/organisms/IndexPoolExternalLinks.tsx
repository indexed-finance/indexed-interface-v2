import { Button, Card, Space } from "antd";
import { ExternalLink } from "components/atomic/atoms";
import { FormattedIndexPool } from "features";
import { Fragment, useMemo } from "react";
import { usePoolQuickswapLink } from "hooks";

const USEFUL_LINKS: Array<{
  text: string;
  image: string;
  makeLink(address: string): string;
}> = [
  {
    text: "View on Etherscan",
    image: require("images/etherscan-link.png").default,
    makeLink: (address) =>
      `https://etherscan.io/address/${address.toLowerCase()}#code`,
  },
  {
    text: "Buy on Uniswap",
    image: require("images/uniswap-link.png").default,
    makeLink: (address) =>
      `https://v2.info.uniswap.org/token/${address.toLowerCase()}`,
  },
];

export function IndexPoolExternalLinks({ id }: FormattedIndexPool) {
  const quickswapLink = usePoolQuickswapLink(id);
  const links = useMemo(
    () =>
      quickswapLink
        ? USEFUL_LINKS.concat({
            text: "Buy on Quickswap",
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
              marginBottom: index === links.length - 1 ? 0 : 12,
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
                <span style={{ flex: 1, fontSize: 16 }}>{text}</span>
              </Space>
            </ExternalLink>
          </Button>
        </Fragment>
      ))}
    </Card>
  );
}
