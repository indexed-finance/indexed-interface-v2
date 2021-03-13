import { Alert, Space, Statistic } from "antd";
import { Token } from "components";
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
  const converted = convert.toComma(
    typeof rate === "number" ? rate : parseFloat(rate)
  );

  return (
    <Alert
      message={
        <Space style={{ width: "100%" }} className="spaced-between">
          <Statistic
            title="Exchange Rate"
            // value={`1 ${baseline} ≈  ${comparison}`}
            valueStyle={{ fontSize: 14 }}
            valueRender={() => (
              <div className="spaced-between">
                <Space style={{ marginRight: 8 }}>
                  1
                  <div style={{ position: "relative", top: -3, right: 0 }}>
                    <Token name={baseline} image={baseline} size="tiny" />
                  </div>
                  {baseline}
                </Space>
                <span>≈</span>
                <Space style={{ marginLeft: 8 }}>
                  {converted}
                  <div style={{ position: "relative", top: -3, right: 0 }}>
                    <Token name={baseline} image={comparison} size="tiny" />
                  </div>
                  {comparison}
                </Space>
              </div>
            )}
          />
          <Statistic
            title="Fee"
            value={fee}
            valueRender={(node) => (
              <Space>
                {node}
                <div style={{ position: "relative", top: -3, right: 0 }}>
                  <Token name={comparison} image={comparison} size="tiny" />
                </div>
                {comparison}
              </Space>
            )}
            valueStyle={{ fontSize: 14 }}
            style={{ flex: 1, textAlign: "right" }}
          />
        </Space>
      }
    />
  );
}
