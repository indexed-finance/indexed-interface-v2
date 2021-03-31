import { ImArrowRight } from "react-icons/im";
import { IndexCard } from "components/molecules";
import { Space, Typography } from "antd";
import { Token } from "components/atoms";
import { selectors } from "features";
import { useSelector } from "react-redux";
import { useTranslation } from "i18n";
import type { Transaction } from "features";

export function TransactionCard({
  transactionHash,
  from,
  to,
  when,
  amount,
  kind,
}: Transaction) {
  const tx = useTranslation();
  const tokenLookup = useSelector(selectors.selectTokenLookupBySymbol);

  return (
    <a
      href={`https://etherscan.com/tx/${transactionHash}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <IndexCard
        centered={false}
        title={
          <Typography.Text type="secondary" className="fancy">
            {kind}
          </Typography.Text>
        }
        headStyle={{
          textAlign: "center",
        }}
        hoverable={true}
        actions={[
          {
            title: tx("WHEN"),
            value: (
              <span style={{ fontSize: 12 }}>
                {tx("ABOUT_X_MINUTES_AGO", {
                  __x: when,
                })}
              </span>
            ),
          },
        ]}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <div>
            {tokenLookup[from.toLowerCase()] && (
              <Space direction="vertical">
                <Token
                  address={tokenLookup[from.toLowerCase()].id}
                  name={from}
                  image={from}
                  size="large"
                />
                <Typography.Title level={3} style={{ textAlign: "center" }}>
                  {from}
                </Typography.Title>
              </Space>
            )}
          </div>
          <ImArrowRight style={{ fontSize: 36 }} />
          {tokenLookup[to.toLowerCase()] && (
            <Space direction="vertical">
              <Token
                address={tokenLookup[to.toLowerCase()].id}
                name={to}
                image={to}
                size="large"
              />
              <Typography.Title level={3} style={{ textAlign: "center" }}>
                {to}
              </Typography.Title>
            </Space>
          )}
        </div>
        {amount && (
          <Typography.Title
            type={kind === "sell" ? "danger" : "success"}
            level={2}
            className="no-margin-bottom"
            style={{
              marginTop: 15,
              textAlign: "center",
            }}
          >
            {amount}
          </Typography.Title>
        )}
      </IndexCard>
    </a>
  );
}
