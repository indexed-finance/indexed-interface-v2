import { Select } from "antd";
import { selectors } from "features";
import { useSelector } from "react-redux";
import React from "react";

const { Option } = Select;

export default function LanguageSelector() {
  const language = useSelector(selectors.selectLanguageName);

  return (
    <Select value={language} className="LanguageSelector">
      <Option value="english">English</Option>
    </Select>
  );
}
