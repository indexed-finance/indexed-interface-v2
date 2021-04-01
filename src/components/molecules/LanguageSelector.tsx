import { Select } from "antd";
import { actions, selectors } from "features";
import { useBreakpoints } from "hooks";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import type { SupportedLanguageCode } from "helpers";

const { Option } = Select;

export function LanguageSelector() {
  const dispatch = useDispatch();
  const language = useSelector(selectors.selectLanguageName);
  const supportedLanguages = useSelector(selectors.selectSupportedLanguages);
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
