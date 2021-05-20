import { Button, Typography } from "antd";
import { useTranslator } from "hooks";

type Props = {
  showBalance: boolean;
  balance: number;
  error?: string;
  onClickMax?: () => void;
}

export function TokenInputDecorator({
  showBalance,
  balance,
  error,
  onClickMax
}: Props) {
  const tx = useTranslator();
  if (error) {
    return <Typography.Text
      type="warning"
      style={{ textAlign: "left", color: 'red' }}
    > {error} </Typography.Text>
  }
  if (!showBalance) return null;

  return <Typography.Text
    type="secondary"
    style={{ textAlign: "left" }}
  >
    {balance > 0 ? (
      <>
        Balance: {balance}{" "}
        <Button
            type="text"
            onClick={onClickMax}
            style={{ fontSize: 12 }}
          >
            {tx("MAX")}
          </Button>
      </>
    ) : (
      tx("NO_BALANCE")
    )}
  </Typography.Text>
}