import { ScreenHeader } from "components";
import { useTranslator } from "hooks";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function DocsList() {
  const tx = useTranslator();

  return (
    <>
      <ScreenHeader title={tx("DOCS")} />
      <ReactMarkdown>{(data as any).docs}</ReactMarkdown>
    </>
  );
}
