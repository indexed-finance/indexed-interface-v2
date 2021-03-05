import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function DocsDetail() {
  // "/foo/bar/baz.md" -> "foo/bar/baz"
  const detail = (data as any)[window.location.pathname.slice(1).split(".")[0]];

  return detail ? (
    <>
      <ScreenHeader title="Document" />
      <Subscreen icon={null} title="Extras">
        <ReactMarkdown>{detail}</ReactMarkdown>
      </Subscreen>
    </>
  ) : null;
}
