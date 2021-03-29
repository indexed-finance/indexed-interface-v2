import type { SupportedLanguageCode } from "./translate";

export default function getSupportedLanguages() {
  return [
    {
      title: "English",
      value: "en-us",
    },
    {
      title: "Spanish",
      value: "es-mx",
    },
    {
      title: "Chinese",
      value: "zh-cn",
    },
  ] as Array<{
    title: string;
    value: SupportedLanguageCode;
  }>;
}
