import { Divider, Space, Statistic } from "antd";
import { FormattedIndexPool } from "features";
import { useTranslator } from "hooks";

export function Performance({
  indexPool,
  direction = "horizontal",
}: {
  indexPool: FormattedIndexPool;
  direction?: "vertical" | "horizontal";
}) {
  const tx = useTranslator();
  const oppositeDirection: Record<
    "vertical" | "horizontal",
    "vertical" | "horizontal"
  > = {
    vertical: "horizontal",
    horizontal: "vertical",
  };
  const dividerDirection = oppositeDirection[direction];

  return (
    <Space
      direction={direction}
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
        value={indexPool.totalValueLocked}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Divider type={dividerDirection} />
      <Statistic
        title={tx("VOLUME")}
        value={indexPool.volume}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Divider type={dividerDirection} />
      <Statistic
        title={tx("CUMULATIVE_FEES")}
        value={indexPool.cumulativeFee}
        style={{ flex: 1, textAlign: "center" }}
      />
      <Divider type={dividerDirection} />
      <Statistic
        title={tx("SWAP_FEE")}
        value={indexPool.swapFee}
        style={{ flex: 1, textAlign: "center" }}
      />
    </Space>
  );
}
