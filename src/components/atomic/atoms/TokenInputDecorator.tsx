import { Button, Popover, Typography } from "antd";
import { useTranslator } from "hooks";

type Props = {
  showBalance: boolean;
  balance: number;
  error?: string;
  onClickMax?: () => void;
};

export function TokenInputDecorator({
  showBalance,
  balance,
  error,
  onClickMax,
}: Props) {
  const tx = useTranslator();

  if (!showBalance) return null;

  return (
    <Typography.Text type="secondary" style={{ textAlign: "left" }}>
      {balance > 0 ? (
        <>
          Balance: <AbbreviatedBalance balance={balance} />{" "}
          
          {error && (
            <Typography.Text
              type="warning"
              style={{ color: "red", marginLeft: 12 }}
            >
              {" "}
              {error}{" "}
            </Typography.Text>
          )}
          
          {!error && onClickMax && (
            <Button type="text" onClick={onClickMax} style={{ fontSize: 12 }}>
              {tx("MAX")}
            </Button>
          )}
        </>
      ) : (
        tx("NO_BALANCE")
      )}
    </Typography.Text>
  );
}

// #region Helpers
function AbbreviatedBalance({ balance }: { balance: number }) {
  const short = balance.toFixed(4);
  const full = balance.toString();

  return (
    <>
      {short === full ? (
        short
      ) : (
        <Popover title="Balance" content={full}>
          {short}
        </Popover>
      )}
    </>
  );
}
// #endregion
