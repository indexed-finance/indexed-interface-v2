import { AiOutlineArrowRight } from "react-icons/ai";
import { Space, Typography } from "antd";
import { Token } from "components/atoms";
import React from "react";

type Props = {
  baseline: string,
  comparison: string,
}

export default function ExchangeTokenImages({ baseline, comparison }: Props) {
  return (
    <Space align="center" className="spaced-between">
      {baseline && comparison && (
        <div style={{ position: "relative", top: 0, right: 0 }}>
          <Token name="Baseline" image={baseline} />
          <AiOutlineArrowRight
            style={{
              position: "absolute",
              fontSize: "32px",
            }}
          />
          <Token name="Comparison" image={comparison} />
        </div>
      )}
    </Space>
  );
}
