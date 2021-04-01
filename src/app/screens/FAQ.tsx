import { ScreenHeader } from "components";
import { useTranslator } from "hooks";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function FAQ() {
  const tx = useTranslator();

  return (
    <>
      <ScreenHeader title={tx("FREQUENTLY_ASKED_QUESTIONS")} />
      <ReactMarkdown>{(data as any).faq}</ReactMarkdown>
    </>
  );
}
