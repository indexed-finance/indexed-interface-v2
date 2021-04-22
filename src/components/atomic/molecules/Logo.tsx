import { Space, Typography } from "antd";
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
    <div onClick={() => history.push(link)}>
      <Space
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
          src={require(`images/indexed-${theme}.png`).default}
          style={{
            width: spinning ? 48 : 24,
            height: spinning ? 48 : 24,
            marginRight: spinning ? 12 : 8,
          }}
        />
        {withTitle && (
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {title}
          </Typography.Title>
        )}
      </Space>
    </div>
  );
}
