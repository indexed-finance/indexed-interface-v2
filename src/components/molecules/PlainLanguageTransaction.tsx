import { Alert, Space, Statistic } from "antd";

export default function PlainLanguageTransaction() {
  return (
    <Alert
      type="warning"
      message={
        <Space style={{ width: "100%" }} className="spaced-between">
          <Statistic
            title="In Other Words"
            valueStyle={{ fontSize: 14 }}
            value="Foo bar baz."
          />
        </Space>
      }
    />
  );
}
