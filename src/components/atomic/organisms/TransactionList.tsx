import { Divider, Space } from "antd";
import { JazzIcon } from "../molecules/JazzIcon";
import { selectors } from "features";
import { useSelector } from "react-redux";

export function TransactionList() {
  const transactions = useSelector(selectors.selectTransactions);

  return transactions.length > 0 ? (
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
        <div>
          TX
          <Divider style={{ margin: 0 }} />
        </div>
        {transactions.map((tx) => (
          <JazzIcon key={tx.hash} address={tx.hash} />
        ))}
      </Space>
    </div>
  ) : null;
}
