import { Alert, Space, Statistic } from "antd";
import { Token } from "components/atoms";
import { convert } from "helpers";
import { useBreakpoints, useTranslator } from "hooks";

interface Props {
  baseline: string;
  comparison: string;
  rate: string | number;
  fee: string;
}

export function TokenExchangeRate({ baseline, comparison, fee, rate }: Props) {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();
  const converted = convert.toComma(
    typeof rate === "number" ? rate : parseFloat(rate)
  );

  return (
    <Alert
      message={
        <Space
          style={{ width: "100%" }}
          direction={isMobile ? "vertical" : "horizontal"}
          className={isMobile ? "" : "spaced-between"}
        >
          <Statistic
            title={tx("EXCHANGE_RATE")}
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
            valueStyle={{ fontSize: isMobile ? 12 : 14 }}
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
            valueStyle={{ fontSize: isMobile ? 12 : 14 }}
            style={{ flex: 1, textAlign: isMobile ? "left" : "right" }}
          />
        </Space>
      }
    />
  );
}
