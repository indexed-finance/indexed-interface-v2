import { Select } from "antd";
import { selectors } from "features";
import { useBreakpoints } from "helpers";
import { useSelector } from "react-redux";

import cx from "classnames";

const { Option } = Select;

export default function LanguageSelector() {
  const language = useSelector(selectors.selectLanguageName);
  const breakpoints = useBreakpoints();

  return (
    <Select
      value={language}
      className={cx("LanguageSelector", {
        "is-controlled": !breakpoints.isMobile,
      })}
    >
      <Option value="english">English</Option>
    </Select>
  );
}
