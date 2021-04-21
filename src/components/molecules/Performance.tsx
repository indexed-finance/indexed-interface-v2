import { Divider, Space, Statistic } from "antd";
import { FormattedIndexPool } from "features";
import { useBreakpoints, useTranslator } from "hooks";

export function Performance({ pool }: { pool: FormattedIndexPool }) {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();

  return (
    <Space
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
        title={tx("TOTAL_VALUE_LOCKED")}
        value={pool.totalValueLocked}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Divider type="vertical" />
      <Statistic
        title={tx("VOLUME")}
        value={pool.volume}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Divider type="vertical" />
      <Statistic
        title={tx("CUMULATIVE_FEES")}
        value={pool.cumulativeFee}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Divider type="vertical" />
      <Statistic
        title={tx("SWAP_FEE")}
        value={pool.swapFee}
        style={{ flex: 1, textAlign: "center" }}
      />
    </Space>
  );
}
