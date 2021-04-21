import { IndexCard, Quote } from "components/molecules";
import { Progress, Token } from "components/atoms";
import { Space, Spin, Typography } from "antd";
import { convert } from "helpers";
import { useBreakpoints, useTranslator } from "hooks";
import type { FormattedPoolAsset } from "features";

interface Props {
  token: FormattedPoolAsset;
  rank: number;
}

export function RankedToken({ token }: Props) {
  const tx = useTranslator();
  const { isMobile } = useBreakpoints();

  return (
    <IndexCard
      direction={isMobile ? "vertical" : "horizontal"}
      title={
        <Space align="center" style={{ width: "100%" }}>
          <Token
            address={token.id}
            name={token.name}
            image={token.symbol}
            size="small"
          />
          {token.symbol}
        </Space>
      }
      titleExtra={
        <Space>
          <Quote
            price={token.price}
            netChange={token.netChange}
            netChangePercent={token.netChangePercent}
            kind="small"
            inline={isMobile}
            centered={isMobile}
          />
          <Progress
            size="small"
            type="dashboard"
            percent={parseFloat(token.weightPercentage.replace(/%/g, ""))}
          />
        </Space>
      }
      actions={[
        {
          title: tx("BALANCE_IN_TOKENS"),
          value: `${token.balance} ${token.symbol}`,
        },
        {
          title: tx("BALANCE_IN_USD"),
          value: (
            <Typography.Text type="success">
              {token.balanceUsd ? (
                convert.toCurrency(
                  parseFloat(token.balanceUsd.replace(/,/g, ""))
                )
              ) : (
                <Spin />
              )}
            </Typography.Text>
          ),
        },
      ]}
    />
  );
}
