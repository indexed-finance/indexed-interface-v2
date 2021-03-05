import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function FAQ() {
  return (
    <>
      <ScreenHeader title="Frequently Asked Questions" />
      <Subscreen icon={null}>
        <ReactMarkdown>{(data as any).faq}</ReactMarkdown>
      </Subscreen>
    </>
  );
}
