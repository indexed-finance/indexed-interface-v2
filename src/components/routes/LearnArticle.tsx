import { Page } from "components/layout";
import { Spin } from "antd";
import { useMarkdownData } from "hooks";
import { useParams } from "react-router-dom";
import Markdown from "react-markdown";

export default function Learn() {
  const { slug } = useParams<{ slug: string }>();
  const { title, content } = useMarkdownData(slug);

  return (
    <Page hasPageHeader={true} title={title}>
      {content ? <Markdown>{content}</Markdown> : <Spin />}
    </Page>
  );
}
