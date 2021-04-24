import { PortfolioWidget } from "components/atomic";
import { Space } from "antd";
import { useMemo } from "react";
import { usePortfolioData } from "hooks";

export default function Portfolio() {
  const { ndx, tokens } = usePortfolioData();
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);

  return (
    <Space size="large" wrap={true} align="end">
      {data.map((heldAsset) => (
        <PortfolioWidget key={heldAsset.address} {...heldAsset} />
      ))}
    </Space>
  );
}
