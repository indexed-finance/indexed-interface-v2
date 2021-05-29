import { List, Typography } from "antd";
import { Token } from "components/atomic/atoms";

type Asset = {
  id: string;
  name: string;
  symbol: string;
};

interface Props {
  asset: Asset;
  onClick(asset: Asset): void;
}

const { Item } = List;

export function SelectableToken({ asset, onClick }: Props) {
  return (
    <Item
      onClick={() => onClick(asset)}
      className="SelectableToken"
      style={{ padding: "1rem" }}
    >
      <Item.Meta
        style={{ alignItems: "center" }}
        avatar={<Token address={asset.id} symbol={asset.symbol} name={asset.symbol} />}
        title={
          <Typography.Title
            level={5}
            type="secondary"
            style={{ marginBottom: 0 }}
          >
            {asset.name}
          </Typography.Title>
        }
      />
    </Item>
  );
}
