import { AiOutlineArrowRight } from "react-icons/ai";
import { Space } from "antd";
import { Token } from "components/atoms";
import { useTranslation } from "i18n";

type Props = {
  baseline: string;
  comparison: string;
};

export default function ExchangeTokenImages({ baseline, comparison }: Props) {
  const tx = useTranslation();

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
