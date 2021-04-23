import { AiOutlineStock } from "react-icons/ai";
import { AppState, FormattedIndexPool, selectors } from "features";
import { Button, Divider, Space, Typography } from "antd";
import { Quote, Token } from "components/atomic";
import { useHistory } from "react-router-dom";
import { usePoolDetailRegistrar } from "hooks";
import { useSelector } from "react-redux";

export function IndexPoolWidget(props: FormattedIndexPool) {
  const tokenIds = useSelector((state: AppState) =>
    selectors.selectPoolTokenIds(state, props.id)
  );
  const { push } = useHistory();

  usePoolDetailRegistrar(props.id, tokenIds);

  return (
    <div
      role="button"
      style={{ cursor: "pointer", width: 280 }}
      onClick={() => push(props.slug)}
    >
      <Space
        direction="vertical"
        style={{
          borderRadius: "1.4rem",
          border: "1px solid rgba(255,255,255,0.65)",
          padding: "1rem",
          background: "rgba(0,0,0,0.65)",
        }}
      >
        <Space>
          <Token name={props.name} address={props.id} image="" size="large" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {props.symbol}
            </Typography.Title>
            <Space size="small" style={{ margin: 0 }}>
              <Quote
                inline={true}
                price={props.priceUsd}
                netChangePercent={props.netChangePercent}
              />
            </Space>
          </div>
        </Space>
        <Typography.Paragraph>
          This is a brief description of the purpose of this particular index
          pool.
        </Typography.Paragraph>
        <Divider style={{ margin: 0 }} />
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <span>
              <AiOutlineStock /> TVL
            </span>
            {props.totalValueLocked}
          </Space>
          <Button type="primary">Buy</Button>
        </Space>
      </Space>
    </div>
  );
}
