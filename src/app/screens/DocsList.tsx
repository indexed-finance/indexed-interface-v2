import { ScreenHeader } from "components";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function DocsList() {
  return (
    <>
      <ScreenHeader title="Documentation" />
      <ReactMarkdown>{(data as any).docs}</ReactMarkdown>
    </>
  );
}
