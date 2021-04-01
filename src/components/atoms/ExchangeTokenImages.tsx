import { AiOutlineArrowRight } from "react-icons/ai";
import { Space } from "antd";
import { Token } from "./Token";
import { useTranslator } from "hooks";

type Props = {
  baseline: string;
  comparison: string;
};

export function ExchangeTokenImages({ baseline, comparison }: Props) {
  const tx = useTranslator();

  return (
    <Space align="center" className="spaced-between">
      {baseline && comparison && (
        <div style={{ position: "relative", top: 0, right: 0 }}>
          <Token name={tx("BASELINE")} image={baseline} />
          <AiOutlineArrowRight
            style={{
              position: "absolute",
              fontSize: "32px",
            }}
          />
          <Token name={tx("COMPARISON")} image={comparison} />
        </div>
      )}
    </Space>
  );
}
