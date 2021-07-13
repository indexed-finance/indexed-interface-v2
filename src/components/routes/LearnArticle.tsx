import { Page } from "components/atomic";
import { Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Markdown from "react-markdown";

export default function Learn() {
  const { slug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(require(`data/learn/${slug}.md`).default)
      .then((res) => res.text())
      .then((value) => value.split("export default ").join(""))
      .then((result) => {
        const { title, content } = parseMarkdown(result);

        setTitle(title);
        setContent(content);
      });
  }, [slug]);

  return (
    <Page hasPageHeader={true} title={title}>
      {content ? <Markdown>{content}</Markdown> : <Spin />}
    </Page>
  );
}

// #region Helpers
function parseMarkdown(raw: string) {
  const metadata = raw
    .split("---\\n\\n")[0]
    .split("---\\n")
    .map((x) => x.replace(/\\n/g, ""))
    .slice(1)
    .reduce((prev, next) => {
      const [key, value] = next.split(": ");

      prev[key] = value;

      return prev;
    }, {} as Record<string, string>);

  const content = raw
    .split("---\\n\\n")[1]
    .replace(/";/g, "")
    .replace(/\\n/g, "  \n");

  return {
    title: metadata.title,
    content,
  };
}

// #endregion
