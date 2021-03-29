import { ScreenHeader } from "components";
import { useTranslation } from "i18n";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function FAQ() {
  const tx = useTranslation();

  return (
    <>
      <ScreenHeader title={tx("FREQUENTLY_ASKED_QUESTIONS")} />
      <ReactMarkdown>{(data as any).faq}</ReactMarkdown>
    </>
  );
}
