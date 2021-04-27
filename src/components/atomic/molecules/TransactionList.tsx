import { selectors } from "features";
import { useSelector } from "react-redux";

export function TransactionList() {
  const transactions = useSelector(selectors.selectTransactions);

  return transactions.length > 0 ? (
    <div
      style={{
        position: "fixed",
        top: 165,
        right: 0,
        width: 45,
        height: "25vh",
        background: "rgba(0, 0, 0, 0.65)",
        borderTop: "1px solid rgba(255, 255, 255, 0.65)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.65)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.65)",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        zIndex: 10,
      }}
    ></div>
  ) : null;
}
