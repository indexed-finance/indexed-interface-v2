import { selectors } from "features";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import DEFAULT_TRANSLATION_SET from "./translations/en-us.json";

export type SupportedLanguageCode = "en-us" | "es-mx" | "zh-cn";
export type TranslatedTerm = keyof typeof DEFAULT_TRANSLATION_SET;

export function createTranslator(languageCode: SupportedLanguageCode) {
  let translationSet: Record<string, string>;

  try {
    translationSet = require(`./translations/${languageCode}.json`);
  } catch (error) {
    translationSet = DEFAULT_TRANSLATION_SET;
  }

  return function translate(
    term: TranslatedTerm,
    variables: Record<string, number | string> = {}
  ) {
    for (const variable of Object.keys(variables)) {
      if (!variable.startsWith("__")) {
        throw new Error(
          "Translation: Interpolated variables must be prefixed with an underscore."
        );
      }
    }

    let translation =
      translationSet[term] ||
      (DEFAULT_TRANSLATION_SET as Record<string, string>)[term] ||
      term;

    for (const [variable, value] of Object.entries(variables)) {
      const regularExpression = new RegExp(variable, "g");

      translation = translation.replace(regularExpression, value.toString());
    }

    return translation;
  };
}

export let tx: ReturnType<typeof useTranslation> = createTranslator("en-us"); // Default to Enlish.

export const useTranslation = () => {
  const { languageCode } = useSelector(selectors.selectSettings);
  const translate = useMemo(() => createTranslator(languageCode), [
    languageCode,
  ]);

  tx = translate; // Keep a reference to the current translate function for non-React consumers.

  return translate;
};
