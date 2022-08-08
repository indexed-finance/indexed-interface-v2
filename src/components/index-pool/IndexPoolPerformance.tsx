import { Divider, Space, Statistic } from "antd";
import { FormattedIndexPool } from "features";
import { useBreakpoints, useTranslator } from "hooks";

export function IndexPoolPerformance({
  totalValueLocked,
  volume,
}: FormattedIndexPool) {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();
  const separator = <Divider type="vertical" style={{ height: 40 }} />;

  return (
    <Space
      size="small"
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        flex: 1,
      }}
    >
      <Statistic
        title={tx("VOLUME")}
        value={volume}
        style={{ flex: 1, textAlign: "center" }}
      />
      {!isMobile && separator}
      <Statistic
        title={tx("TOTAL_VALUE_LOCKED")}
        value={totalValueLocked}
        style={{ flex: 1, textAlign: "center" }}
        valueRender={(value) => <div className="colorful">{value}</div>}
      />
    </Space>
  );
}
