import { IndexPoolWidget } from "components/atomic";
import { Space } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";

export default function IndexPools() {
  const indexPools = useSelector(selectors.selectAllFormattedIndexPools);

  return (
    <Space size="large" wrap={true}>
      {indexPools.map((pool) => (
        <IndexPoolWidget key={pool.id} {...pool} />
      ))}
    </Space>
  );
}
