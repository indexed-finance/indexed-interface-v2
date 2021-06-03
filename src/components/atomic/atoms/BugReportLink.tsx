import { Button } from "antd";

export function BugReportLink() {
  return (
    <Button type="default" danger={true} style={{ marginRight: 24 }}>
      <a href="mailto://contact@indexed.finance">Report an issue</a>
    </Button>
  );
}
