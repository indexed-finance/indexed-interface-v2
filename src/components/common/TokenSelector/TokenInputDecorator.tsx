import { BigNumber } from "ethereum";
import { Button, Popover, Typography } from "antd";
import { useTranslator } from "hooks";

type Props = {
  showBalance: boolean;
  balance: {
    displayed: string;
    exact: BigNumber;
  };
  error?: string;
  onClickMax?: () => void;
  balanceLabel?: string;
};

export function TokenInputDecorator({
  showBalance,
  balanceLabel = "Balance",
  balance,
  error,
  onClickMax,
}: Props) {
  const tx = useTranslator();

  if (!showBalance) return null;

  return (
    <>
      {error ? (
        <Typography.Text type="danger" style={{ textAlign: "left" }}>
          {" "}
          {error}{" "}
        </Typography.Text>
      ) : (
        <Typography.Text type="secondary" style={{ textAlign: "left" }}>
          {balance.exact.isGreaterThan(0) ? (
            <>
              {balanceLabel}: <AbbreviatedBalance balance={balance.displayed} />{" "}
              {!error && onClickMax && (
                <Button
                  type="text"
                  onClick={onClickMax}
                  style={{ fontSize: 12 }}
                >
                  {tx("MAX")}
                </Button>
              )}
            </>
          ) : (
            tx("NO_BALANCE")
          )}
        </Typography.Text>
      )}
    </>
  );
}

// #region Helpers
function AbbreviatedBalance({ balance }: { balance: string }) {
  const short = parseFloat(balance).toFixed(4);
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
