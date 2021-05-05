import { List } from "antd";
import { Token } from "components/atomic/atoms";

type Asset = {
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
        avatar={<Token name={asset.symbol} />}
        title={asset.symbol}
        description={asset.name}
      />
    </Item>
  );
}
