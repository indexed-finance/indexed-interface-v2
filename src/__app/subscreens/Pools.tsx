import { PoolCard } from "components";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";

export default function Pools() {
  const pools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <div style={{ minHeight: 400, position: "relative" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {pools.map((pool) => (
          <PoolCard key={pool!.id} pool={pool!} />
        ))}
      </Space>
    </div>
  );
}
