import { BaseType } from "antd/lib/typography/Base";
import { ExternalLink } from "components/atomic/atoms";
import { Space, Typography } from "antd";
import { abbreviateAddress } from "helpers";
import { selectors } from "features";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import cx from "classnames";

export function TransactionList() {
  const transactions = useSelector(selectors.selectTransactions);
  const hiding = useRef<Record<string, true>>({});
  const [hidden, setHidden] = useState<Record<string, true>>({});
  const displayedTransactions = useMemo(
    () => transactions.filter((tx) => !hidden[tx.hash]),
    [transactions, hidden]
  );

  // Effect:
  // 5 seconds after a transaction is confirmed, add it to the "hide" list.
  useEffect(() => {
    for (const tx of transactions) {
      if (
        tx.status === "confirmed" &&
        !hiding.current[tx.hash] &&
        !hidden[tx.hash]
      ) {
        hiding.current[tx.hash] = true;

        setTimeout(() => {
          delete hiding.current[tx.hash];

          setHidden((prev) => ({
            ...prev,
            [tx.hash]: true,
          }));
        }, 5000);
      }
    }
  }, [transactions, hidden]);

  return displayedTransactions.length > 0 ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 165,
        right: 0,
        background: "rgba(0, 0, 0, 0.65)",
        borderTop: "1px solid rgba(255, 255, 255, 0.65)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.65)",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        zIndex: 10,
        padding: 12,
      }}
    >
      <Space
        direction="vertical"
        align="center"
        style={{ justifyContent: "center" }}
      >
        <Typography.Text
          style={{ textTransform: "uppercase" }}
          type="secondary"
        >
          Transactions
        </Typography.Text>
        {displayedTransactions.map((tx) => {
          const statuses: Record<string, BaseType> = {
            confirmed: "success",
            reverted: "danger",
            pending: "warning",
          };

          return (
            <ExternalLink
              key={tx.hash}
              to={`https://etherscan.io/tx/${tx.hash}`}
              withIcon={false}
            >
              <Typography.Text
                className={cx(tx.status === "confirmed" && "fading-out")}
                type={statuses[tx.status]}
                style={{ marginRight: 6 }}
              >
                {abbreviateAddress(tx.hash)}
              </Typography.Text>
            </ExternalLink>
          );
        })}
      </Space>
    </div>
  ) : null;
}
