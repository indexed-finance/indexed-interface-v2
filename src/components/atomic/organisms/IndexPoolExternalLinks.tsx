import { BRIDGED_POLYGON_ADDRESSES } from "config/base-tokens"
import { Button, Card, Space } from "antd";
import { ExternalLink } from "components/atomic/atoms";
import { FormattedIndexPool } from "features";
import { Fragment, useMemo } from "react";
import { NETWORKS_BY_ID } from "../../../config/network";
import { exchangeAddLiquidityLink, exchangeSwapLink, explorerAddressLink } from "helpers";
import { useChainId } from "hooks";

const usePoolExternalLinks = (address: string, chainId: number): Array<{
  text: string;
  image: string;
  url: string;
}> => {
  const {explorer, defaultExchange} = NETWORKS_BY_ID[chainId];
  const explorerLink = useMemo(() => ({
    text: `View on ${explorer.name}`,
    image: require(`images/${explorer.icon}`).default,
    url: explorerAddressLink(address, chainId)
  }), [address, explorer, chainId])
  const addLiquidityLink = useMemo(() => ({
    text: `Add Liquidity on ${defaultExchange.name}`,
    image: require(`images/${defaultExchange.icon}`).default,
    url: exchangeAddLiquidityLink(address, 'ETH', chainId)
  }), [chainId, address, defaultExchange]);
  const bridgeQuickswapLink = useMemo(() => {
    if (chainId === 1) {
      const polygonExplorer = NETWORKS_BY_ID[137];
      const bridgedAddress = BRIDGED_POLYGON_ADDRESSES[address.toLowerCase()];
      return {
        text: "Buy on Quickswap",
        image: require(`images/${polygonExplorer.explorer.icon}`).default,
        url: exchangeSwapLink(bridgedAddress, 'ETH', 137)
      };
    }
  }, [address, chainId]);
  return [
    explorerLink,
    addLiquidityLink,
    ...(bridgeQuickswapLink ? [bridgeQuickswapLink] : [])
  ]
}

export function IndexPoolExternalLinks({ id }: FormattedIndexPool) {
  const chainId = useChainId();
  // const quickswapLink = usePoolQuickswapLink(id);
  const links = usePoolExternalLinks(id, chainId);

  return (
    <Card>
      {links.map(({ text, image, url }, index) => (
        <Fragment key={text}>
          <Button
            type="text"
            block={true}
            style={{
              padding: "0 40px",
              marginBottom: index === links.length - 1 ? 0 : 12,
            }}
          >
            <ExternalLink to={url}>
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
