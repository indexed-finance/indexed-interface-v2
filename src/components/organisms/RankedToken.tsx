import { Asset } from "features";
import { Divider, Progress, Space, Typography } from "antd";
import { IndexCard, Quote } from "components/molecules";
import { Token } from "components/atoms";
import { convert, useBreakpoints } from "helpers";

export interface Props {
  token: Asset;
  rank: number;
}

export default function RankedToken({ token }: Props) {
  const { isMobile } = useBreakpoints();

  return (
    <>
      <IndexCard
        direction={isMobile ? "vertical" : "horizontal"}
        style={{ minWidth: isMobile ? 0 : 400, width: isMobile ? 280 : "auto" }}
        title={
          <Space align="center" className="no-margin-bottom">
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
          <Quote
            price={token.price}
            netChange={token.netChange}
            netChangePercent={token.netChangePercent}
            isNegative={token.isNegative}
            kind="small"
            inline={isMobile}
            centered={isMobile}
          />
        }
        actions={[
          {
            title: "Balance (in tokens)",
            value: `${token.balance} ${token.symbol}`,
          },
          {
            title: "Balance (in USD)",
            value: (
              <Typography.Text type="success">
                {token.balanceUsd
                  ? convert.toCurrency(
                      parseFloat(token.balanceUsd.replace(/,/g, ""))
                    )
                  : ""}
              </Typography.Text>
            ),
          },
        ]}
      >
        <Progress
          type="dashboard"
          percent={parseFloat(token.weightPercentage.replace(/%/g, ""))}
        />
      </IndexCard>
      {isMobile && <Divider />}
    </>
  );
}
