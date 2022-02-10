import { Select } from "antd";
import { actions } from "features";
import { useBreakpoints, useLanguageName, useSupportedLanguages } from "hooks";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";
import type { SupportedLanguageCode } from "helpers";

const { Option } = Select;

export function LanguageSelector() {
  const dispatch = useDispatch();
  const language = useLanguageName()
  const supportedLanguages = useSupportedLanguages()
  const breakpoints = useBreakpoints();
  const handleLanguageChange = useCallback(
    (nextLanguage: string) =>
      dispatch(actions.languageChanged(nextLanguage as SupportedLanguageCode)),
    [dispatch]
  );

  return (
    <Select
      value={language}
      onChange={handleLanguageChange}
      className={cx("LanguageSelector", {
        "is-controlled": !breakpoints.isMobile,
      })}
    >
      {supportedLanguages.map(({ title, value }) => (
        <Option key={value} value={value}>
          {title}
        </Option>
      ))}
    </Select>
  );
}
