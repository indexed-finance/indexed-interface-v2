import { Page } from "components/atomic";
import { Typography } from "antd";
import articles from "data/learn";

export default function Learn() {
  return (
    <Page hasPageHeader={true} title="Foo">
      <Typography.Text>There are {articles.length} articles.</Typography.Text>
    </Page>
  );
}
