import { Button, Divider, List, Space, Typography } from "antd";
import { FaCaretRight, FaTractor } from "react-icons/fa";
import { FormattedIndexPool, selectors } from "features";
import { Link } from "react-router-dom";
import { Quote, Token } from "components/atomic";
import { useSelector } from "react-redux";
import { useTranslator } from "hooks";

const MAXIMUM_DISPLAYED_ASSETS = 50;

function PoolItem(pool: FormattedIndexPool) {
  const {
    id,
    canStake,
    symbol,
    priceUsd,
    netChange,
    netChangePercent,
    assets,
    category,
    name,
    slug,
  } = pool;
  const tx = useTranslator();
  const categoryLookup = useSelector(selectors.selectCategoryLookup);
  const categoryTitle = categoryLookup[category]?.name ?? "";
  const slicedAssets = assets
    .slice(0, MAXIMUM_DISPLAYED_ASSETS)
    .map((asset) => (
      <Token
        key={asset.id}
        name={asset.name}
        image={asset.id}
        address={asset.id}
      />
    ));
  const remainder = Math.max(0, assets.length - MAXIMUM_DISPLAYED_ASSETS);

  if (remainder) {
    slicedAssets.push(
      <Typography.Text key="more" type="secondary">
        and {remainder} more
      </Typography.Text>
    );
  }

  return (
    <List.Item style={{ paddingRight: 20, paddingLeft: 20 }}>
      <div
        className="colored-text"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space style={{ flex: 1 }}>
              <Token
                name={name}
                image={id}
                address={id}
                symbol={symbol}
                size="large"
              />
              <Divider type="vertical" />
              <Quote
                price={priceUsd}
                netChange={netChange}
                netChangePercent={netChangePercent}
                inline={true}
              />
              {canStake && (
                <>
                  <Button type="primary" size="large">
                    <Space>
                      <FaTractor style={{ position: "relative", top: 2 }} />
                      <span>{tx("STAKE")}</span>
                    </Space>
                  </Button>
                </>
              )}
            </Space>
            <Space>
              <Typography.Title
                level={3}
                style={{ margin: 0, textAlign: "right" }}
              >
                <Link to={slug}>{name}</Link>
              </Typography.Title>
              <Divider type="vertical" />
              <Button type="primary">
                <Link to={slug}>
                  <Space>
                    <span>View Pool</span>
                    <FaCaretRight style={{ position: "relative", top: 2 }} />
                  </Space>
                </Link>
              </Button>
            </Space>
          </div>
        </Space>
      </div>
      <Space
        size="large"
        style={{
          width: "100%",
          marginTop: 10,
          justifyContent: "space-between",
        }}
      >
        <div>{slicedAssets}</div>
        {categoryTitle && (
          <Typography.Title level={4}>
            Category:{" "}
            <Typography.Text type="secondary">
              <em>{categoryTitle}</em>
            </Typography.Text>
          </Typography.Title>
        )}
      </Space>
    </List.Item>
  );
}

export default function Pools() {
  const pools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <List itemLayout="vertical">
      {pools.map((pool) => (
        <PoolItem key={pool.id} {...pool} />
      ))}
    </List>
  );
}
