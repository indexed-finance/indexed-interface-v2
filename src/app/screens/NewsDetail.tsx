import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function NewsDetail() {
  const detail = (data as any)[window.location.pathname.slice(1)];

  if (!detail) {
    window.location.href = "/";
  }

  return detail ? (
    <>
      <ScreenHeader title="News" />
      <Subscreen icon={null} title="Extras">
        <ReactMarkdown>{detail}</ReactMarkdown>
      </Subscreen>
    </>
  ) : null;
}
