import { Page } from "components/atomic";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export default function Learn() {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("/data/learn/foo.md")
      .then((response) => response.text())
      .then(setText);
  }, []);

  useEffect(() => {
    fetch("/data/learn")
      // .then((response) => response.text())
      .then(console.log);
  }, []);

  return (
    <Page hasPageHeader={true} title="Foo">
      {text ? <Markdown>{text}</Markdown> : <p>Loading...</p>}
    </Page>
  );
}
