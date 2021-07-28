import { Space, Typography } from "antd";
import { useBreakpoints } from "hooks";
import { useHistory } from "react-router-dom";
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
  size = "small",
  spinning = false,
}: Props) {
  const history = useHistory();
  const { isMobile } = useBreakpoints();
  const imageProps =
    size === "large"
      ? {
          width: spinning ? 128 : 64,
          height: spinning ? 128 : 64,
          marginRight: spinning ? 12 : 8,
          position: "relative",
          top: -3,
        }
      : {
          width: spinning ? 48 : 24,
          height: spinning ? 48 : 24,
          marginRight: spinning ? 12 : 8,
          position: "relative",
          top: -3,
        };

  return (
    <div onClick={() => history.push(link)} style={{ cursor: "pointer" }}>
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
          src={require(`images/indexed.png`).default}
          style={imageProps as any}
        />
        {withTitle && (
          <Typography.Title
            level={isMobile ? 3 : 1}
            style={{
              marginBottom: 0,
              fontSize: size === "large" ? (isMobile ? 48 : 72) : "initial",
            }}
          >
            {title}
          </Typography.Title>
        )}
      </Space>
    </div>
  );
}
