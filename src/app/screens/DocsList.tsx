import { ScreenHeader } from "components";
import { Subscreen } from "../subscreens";
import React from "react";
import ReactMarkdown from "react-markdown";
import data from "data.json";
import md2json from "md-2-json";

export default function DocsList() {
  const {
    Protocol: protocol,
    "Smart Contracts": smartContracts,
  } = md2json.parse((data as any).docs)["Table of Contents"];

  return (
    <>
      <ScreenHeader title="Docs" />
      <Subscreen icon={null} title="Extras">
        Protocol
        {protocol.raw.split("\n").map((link: string, index: number) => (
          <ReactMarkdown key={index}>{link}</ReactMarkdown>
        ))}
        Smart Contracts
        {smartContracts.raw.split("\n").map((link: string, index: number) => (
          <ReactMarkdown key={index}>{link}</ReactMarkdown>
        ))}
        <ReactMarkdown>{(data as any).docs}</ReactMarkdown>
      </Subscreen>
    </>
  );
}
