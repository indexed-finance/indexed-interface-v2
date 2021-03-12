import { Alert, Statistic, Typography } from "antd";
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
        <Typography.Title level={4}>
          <Statistic
            title="Exchange Rate"
            value={`1 ${baseline} ≈ ${convert.toComma(
              typeof rate === "number" ? rate : parseFloat(rate)
            )} ${comparison}`}
          />
          <Statistic title="Fee" value={fee} />
        </Typography.Title>
      }
    />
  );
}
