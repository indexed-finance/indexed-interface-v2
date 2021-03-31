import { Typography } from "antd";
import { selectors } from "features";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import cx from "classnames";

interface Props {
  link?: string;
  title?: string;
  withTitle?: boolean;
  size?: "small" | "large";
  animated?: boolean;
  spinning?: boolean;
}

export function Logo({
  link = "/",
  withTitle = true,
  title = "INDEXED",
  spinning = false,
}: Props) {
  const history = useHistory();
  const theme = useSelector(selectors.selectTheme);

  return (
    <div
      className="Logo"
      onClick={() => history.push(link)}
      style={{
        transform: spinning ? "scale(2)" : "none",
        opacity: spinning ? 0.6 : 1,
      }}
    >
      <img
        className={cx({
          "is-spinning": spinning,
        })}
        alt=""
        src={require(`assets/images/indexed-${theme}.png`).default}
        style={{
          width: spinning ? 48 : 24,
          height: spinning ? 48 : 24,
          marginRight: spinning ? 12 : 8,
        }}
      />
      {withTitle && <Typography.Title level={3}>{title}</Typography.Title>}
    </div>
  );
}
