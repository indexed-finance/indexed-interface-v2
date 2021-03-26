import { FormattedIndexPool } from "features";
import { Space, Statistic } from "antd";
import { useBreakpoints } from "helpers";

export default function Performance({ pool }: { pool: FormattedIndexPool }) {
  const { isMobile } = useBreakpoints();

  return (
    <Space
      className="Performance"
      direction={isMobile ? "vertical" : "horizontal"}
      style={{
        flex: 1,
        flexWrap: "wrap",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 20,
      }}
    >
      <Statistic
        title="Total Value Locked"
        value={pool.totalValueLocked}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Statistic
        title="Volume"
        value={pool.volume}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Statistic
        title="Cumulative Fees"
        value={pool.cumulativeFee}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Statistic
        title="Swap Fee"
        value={pool.swapFee}
        style={{ flex: 1, textAlign: "center" }}
      />
    </Space>
  );
}
