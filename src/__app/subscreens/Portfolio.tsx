import { FaTractor } from "react-icons/fa";
import { List, Space, Typography } from "antd";
import { Progress, Token } from "components/atoms";
import { useMemo } from "react";
import { usePortfolioData } from "hooks/portfolio-hooks";
import { useTranslator } from "hooks";

export default function Portfolio() {
  const tx = useTranslator();
  const { ndx, tokens } = usePortfolioData();
  const data = useMemo(
    () => [ndx, ...tokens].map((t) => ({ ...t, staking: "0.05" })),
    [ndx, tokens]
  );

  return (
    <List
      dataSource={data}
      header={
        <div
          className="colored-text"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>
            Asset
          </Typography.Title>
          <Typography.Title
            level={4}
            style={{ margin: 0, textAlign: "center", flex: 1 }}
          >
            Weight
          </Typography.Title>
          <Typography.Title
            level={4}
            style={{ margin: 0, textAlign: "right", flex: 1 }}
          >
            Value (in USD)
          </Typography.Title>
        </div>
      }
      renderItem={(item) => (
        <List.Item>
          <div
            className="colored-text"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Space direction="vertical" style={{ flex: 1 }}>
              <Token
                name={item.name}
                image={item.image}
                symbol={item.symbol}
                amount={item.balance}
              />
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
            </Space>
            <Progress
              style={{ flex: 1, fontSize: 24, textAlign: "center" }}
              width={90}
              status="active"
              type="dashboard"
              percent={parseFloat(item.weight.replace(/%/g, ""))}
            />
            <Typography.Text
              type="success"
              style={{ flex: 1, fontSize: 24, textAlign: "right" }}
            >
              {item.value}
            </Typography.Text>
          </div>
          {/* <List.Item.Meta
            style={{ alignItems: "center" }}
            title={
              
            }
            description={
              (item.ndxEarned && item.ndxEarned !== "0.00") || item.staking ? (
                
              ) : null
            }
          /> */}
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
