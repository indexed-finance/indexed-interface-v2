import { Divider, Space } from "antd";
import { FormattedIndexPool } from "features";
import { PlainLanguageTransaction, TokenExchangeRate } from "components";
import { useFormikContext } from "formik";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";

interface Props {
  pool: FormattedIndexPool;
}

export default function SwapInteraction({ pool }: Props) {
  return (
    <BaseInteraction
      title="Swap"
      pool={pool}
      onSubmit={console.log}
      extra={<SwapExtras />}
    />
  );
}

function SwapExtras() {
  const { values } = useFormikContext<InteractionValues>();
  const { fromToken, toToken } = values;

  return fromToken && toToken ? (
    <>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <TokenExchangeRate
          baseline={fromToken}
          comparison={toToken}
          rate=""
          fee=""
        />
        <PlainLanguageTransaction />
      </Space>
      <Divider />
    </>
  ) : null;
}
