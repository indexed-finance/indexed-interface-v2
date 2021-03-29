import { ScreenHeader } from "components";
import { useTranslation } from "i18n";
import ReactMarkdown from "react-markdown";
import data from "data.json";

export default function DocsList() {
  const translate = useTranslation();

  return (
    <>
      <ScreenHeader title={translate("DOCS")} />
      <ReactMarkdown>{(data as any).docs}</ReactMarkdown>
    </>
  );
}
