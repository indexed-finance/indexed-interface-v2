import { Button } from "antd";

export function BugReportLink() {
  return (
    <a href="mailto://contact@indexed.finance">
      <Button type="default" danger={true} style={{ marginRight: 24 }}>
        Report an issue
      </Button>
    </a>
  );
}
