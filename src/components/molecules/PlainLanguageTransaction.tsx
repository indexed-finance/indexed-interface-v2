import { Alert, Space, Statistic } from "antd";
import { useTranslation } from "i18n";

export default function PlainLanguageTransaction() {
  const tx = useTranslation();

  return (
    <Alert
      type="warning"
      message={
        <Space style={{ width: "100%" }} className="spaced-between">
          <Statistic
            title={tx("IN_OTHER_WORDS")}
            valueStyle={{ fontSize: 14 }}
            value="Foo bar baz."
          />
        </Space>
      }
    />
  );
}
