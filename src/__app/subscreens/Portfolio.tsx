import { Divider, List, Space, Typography } from "antd";
import { FaTractor } from "react-icons/fa";
import { Progress, Token } from "components/atoms";
import { useMemo } from "react";
import { usePortfolioData } from "hooks/portfolio-hooks";
import { useTranslator } from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  const { ndx, tokens } = usePortfolioData();
  const data = useMemo(() => [ndx, ...tokens], [ndx, tokens]);

  return (
    <List
      split={false}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Progress
                width={60}
                status="active"
                type="dashboard"
                percent={parseFloat(item.weight.replace(/%/g, ""))}
              />
            }
            title={
              <Space size="small">
                <Token
                  name={item.name}
                  image={item.image}
                  symbol={item.symbol}
                  amount={item.balance}
                />
                <Divider type="vertical" />
                <Typography.Text type="success" style={{ fontSize: 24 }}>
                  {item.value}
                </Typography.Text>
              </Space>
            }
            description={
              <>
                {item.ndxEarned && item.ndxEarned !== "0.00" && (
                  <Typography.Text type="secondary">
                    {tx("EARNED_X_NDX", {
                      __x: item.ndxEarned,
                    })}
                  </Typography.Text>
                )}
                {item.staking && (
                  <Typography.Text type="secondary">
                    <Space size="small">
                      <FaTractor />
                      <em>
                        {tx("STAKING_X_Y", {
                          __x: item.staking,
                          __y: item.symbol,
                        })}
                      </em>
                    </Space>
                  </Typography.Text>
                )}
              </>
            }
          />
        </List.Item>
      )}
    />
  );

  // return (
  //   <Space
  //     wrap={true}
  //     size="large"
  //     style={{ width: "100%", alignItems: "stretch" }}
  //   >
  //     <PortfolioCard {...ndx} />
  //     {tokens.map((token) => (
  //       <PortfolioCard key={token.address} {...token} />
  //     ))}
  //   </Space>
  // );
}
