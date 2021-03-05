import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function DocsList() {
  return (
    <>
      <ScreenHeader title="Docs" />
      <Subscreen icon={null} title="Extras">
        <ReactMarkdown>{(data as any).docs}</ReactMarkdown>
      </Subscreen>
    </>
  );
}
