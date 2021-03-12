import { Alert, Space, Statistic } from "antd";
import { convert } from "helpers";

export interface Props {
  baseline: string;
  comparison: string;
  rate: string | number;
  fee: string;
}

export default function TokenExchangeRate({
  baseline,
  comparison,
  fee,
  rate,
}: Props) {
  return (
    <Alert
      message={
        <Space style={{ width: "100%" }}>
          <Statistic
            title="Exchange Rate"
            value={`1 ${baseline} ≈ ${convert.toComma(
              typeof rate === "number" ? rate : parseFloat(rate)
            )} ${comparison}`}
          />
          <Statistic
            title="Fee"
            value={fee}
            style={{ flex: 1, textAlign: "right" }}
          />
        </Space>
      }
    />
  );
}
