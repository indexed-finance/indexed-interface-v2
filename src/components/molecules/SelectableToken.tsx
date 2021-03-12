import { FormattedIndexPool } from "features";
import { List } from "antd";
import { Token } from "components/atoms";

type Asset = FormattedIndexPool["assets"][0];

interface Props {
  asset: Asset;
  onClick(asset: Asset): void;
}

const { Item } = List;

export default function SelectableToken({ asset, onClick }: Props) {
  return (
    <Item onClick={() => onClick(asset)}>
      <Item.Meta
        avatar={<Token name={asset.symbol} image={asset.symbol} />}
        title={asset.symbol}
        description={asset.name}
      />
    </Item>
  );
}
