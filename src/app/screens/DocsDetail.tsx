import { ScreenHeader } from "components";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function DocsDetail() {
  // "/foo/bar/baz.md" -> "foo/bar/baz"
  const detail = (data as any)[window.location.pathname.slice(1).split(".")[0]];

  return (
    <>
      <ScreenHeader title="Document" />
      {detail && <ReactMarkdown>{detail}</ReactMarkdown>}
    </>
  );
}
