import { BaseType } from "antd/lib/typography/Base";
import { BiLinkExternal } from "react-icons/bi";
import { Button, Space, Typography, notification } from "antd";
import { ExternalLink } from "components/common";
import { abbreviateAddress, explorerTransactionLink } from "helpers";
import { actions, selectors } from "features";
import { useChainId } from "hooks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";

const LOCALSTORAGE_KEY = "Hidden Tx";

export function TransactionList() {
  const chainId = useChainId();
  const transactions = useSelector(selectors.selectTransactions);
  const hiding = useRef<Record<string, true>>({});
  const [hidden, setHidden] = useState<Record<string, true>>(
    JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY) || "{}")
  );
  const displayedTransactions = useMemo(
    () => transactions.filter((tx) => !hidden[tx.hash]),
    [transactions, hidden]
  );
  const dispatch = useDispatch();

  // Effect:
  // When a transaction is hidden, persist it so it doesn't continually show.
  useEffect(() => {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(hidden));
  }, [hidden]);

  // Effect:
  // - 5 seconds after a transaction is confirmed, add it to the "hide" list.
  // - 90 seconds after a transaction is rejected, add it to the "hide" list.
  useEffect(() => {
    for (const tx of transactions) {
      if (!hiding.current[tx.hash] && !hidden[tx.hash]) {
        if (tx.status === "confirmed") {
          hiding.current[tx.hash] = true;

          notification.success({
            message: "Transaction confirmed",
            description: `${abbreviateAddress(tx.hash)} was confirmed.`,
          });

          setTimeout(() => {
            delete hiding.current[tx.hash];

            setHidden((prev) => ({
              ...prev,
              [tx.hash]: true,
            }));
          }, 5000);
        } else if (tx.status === "reverted") {
          hiding.current[tx.hash] = true;

          notification.error({
            message: "Transaction rejected",
            description: `${abbreviateAddress(tx.hash)} was rejected.`,
          });

          setTimeout(() => {
            delete hiding.current[tx.hash];

            setHidden((prev) => ({
              ...prev,
              [tx.hash]: true,
            }));
          }, 1000 * 60 * 1.5);
        }
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
              to={explorerTransactionLink(tx.hash, chainId)}
              withIcon={false}
            >
              <Typography.Text
                className={cx(
                  (tx.status === "confirmed" || tx.status === "reverted") &&
                    "fading-out"
                )}
                type={statuses[tx.status]}
                style={{ marginRight: 6 }}
              >
                {abbreviateAddress(tx.hash)} <BiLinkExternal />
              </Typography.Text>
            </ExternalLink>
          );
        })}
        <Button
          type="default"
          block={true}
          onClick={() => dispatch(actions.transactionsCleared())}
        >
          Clear
        </Button>
      </Space>
    </div>
  ) : null;
}
