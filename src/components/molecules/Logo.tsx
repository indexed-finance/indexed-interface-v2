import { Typography } from "antd";
import { selectors } from "features";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import React from "react";

interface Props {
  link?: string;
  title?: string;
  withTitle?: boolean;
  size?: "small" | "large";
  animated?: boolean;
}

export default function Logo({
  link = "/",
  withTitle = true,
  title = "Indexed",
}: Props) {
  const history = useHistory();
  const theme = useSelector(selectors.selectTheme);

  return (
    <div className="Logo" onClick={() => history.push(link)}>
      <img
        className="size-32 small-margin-right"
        alt=""
        src={require(`assets/images/indexed-${theme}.png`).default}
      />
      {withTitle && <Typography.Title level={3}>{title}</Typography.Title>}
    </div>
  );
}
