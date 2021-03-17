import { Avatar, Card, Space, Typography } from "antd";
import { FormattedIndexPool } from "features";
import { ImArrowLeft, ImArrowRight } from "react-icons/im";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Token } from "components/atoms";
import { useBreakpoints } from "helpers";
import noop from "lodash.noop";

interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  assets?: FormattedIndexPool["assets"];
  onClick?(): void;
}

export default function ListCard({
  title = "",
  subtitle = "",
  extra = null,
  children = null,
  assets = [],
  onClick = noop,
}: Props) {
  const { isMobile } = useBreakpoints();
  const [scrollableDirections, setScrollableDirections] = useState({
    up: false,
    right: false,
    down: false,
    left: false,
  });
  const tokenWrapper = useRef<null | HTMLDivElement>(null);

  // Effect:
  // When the box scrolls, show arrows depending on which directions are scrollable.
  // eslint-disable-next-line
  useEffect(() => {
    const outerWrapper = tokenWrapper.current;
    const parent = outerWrapper?.parentNode;

    if (outerWrapper && parent) {
      const determineScrollableDirections = () => {
        const parentAtTheTime = outerWrapper.parentNode;

        if (parentAtTheTime) {
          const {
            clientWidth,
            clientHeight,
            scrollWidth,
            scrollLeft,
            scrollTop,
            scrollHeight,
          } = parentAtTheTime as any;
          const nextScrollableDirections = {
            up: scrollTop > 0,
            right: clientWidth + scrollLeft < scrollWidth,
            down: clientHeight + scrollTop < scrollHeight,
            left: scrollLeft > 0,
          };

          if (
            JSON.stringify(nextScrollableDirections) !==
            JSON.stringify(scrollableDirections)
          ) {
            setScrollableDirections(nextScrollableDirections);
          }
        }
      };

      determineScrollableDirections();

      parent.addEventListener("scroll", determineScrollableDirections);

      return () => {
        parent.removeEventListener("scroll", determineScrollableDirections);
      };
    }
  });

  return (
    <Card
      onClick={onClick}
      hoverable={onClick !== noop}
      style={{ marginBottom: 30, position: "relative" }}
      title={
        <Space
          align="start"
          className="spaced-between"
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ width: "100%", textAlign: isMobile ? "center" : "left" }}
          wrap={true}
        >
          <div>
            {subtitle && (
              <Typography.Title
                type="secondary"
                level={isMobile ? 5 : 3}
                style={{
                  marginBottom: 0,
                }}
              >
                {subtitle}
              </Typography.Title>
            )}
            {title && (
              <Typography.Title
                level={isMobile ? 5 : 2}
                style={{
                  marginTop: 0,
                }}
              >
                {title}
              </Typography.Title>
            )}
          </div>
          {extra}
        </Space>
      }
      actions={[
        <Avatar.Group
          maxCount={isMobile ? 4 : 20}
          style={{
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          {assets.map((token, index) => [
            <Token
              key={index}
              address={token.id}
              name={token.symbol}
              image={token.symbol}
              size={isMobile ? "small" : "medium"}
            />,
          ])}
        </Avatar.Group>,
      ]}
    >
      <ImArrowLeft
        className="ScrollableArrow"
        style={{
          position: "absolute",
          left: 30,
          bottom: 15,
          visibility: scrollableDirections.left ? "visible" : "hidden",
        }}
      />
      <ImArrowRight
        className="ScrollableArrow"
        style={{
          position: "absolute",
          right: 30,
          bottom: 15,
          visibility: scrollableDirections.right ? "visible" : "hidden",
        }}
      />
      <div ref={tokenWrapper}>{children}</div>
    </Card>
  );
}
