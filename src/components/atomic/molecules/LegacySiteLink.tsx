import { Button } from "antd";
import { ExternalLink } from "components/atomic/atoms";

export function LegacySiteLink() {
  return (
    <Button type="default">
      <ExternalLink to="https://legacy.indexed.finance/">
        Legacy site
      </ExternalLink>
    </Button>
  );
}
