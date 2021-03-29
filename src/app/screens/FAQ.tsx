import { ScreenHeader } from "components";
import { useTranslation } from "i18n";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function FAQ() {
  const translate = useTranslation();

  return (
    <>
      <ScreenHeader title={translate("FREQUENTLY_ASKED_QUESTIONS")} />
      <ReactMarkdown>{(data as any).faq}</ReactMarkdown>
    </>
  );
}
