import { Divider, Space } from "antd";
import { FormattedIndexPool, selectors } from "features";
import { PlainLanguageTransaction, TokenExchangeRate } from "components";
import { actions } from "features";
import { getSwapCost } from "./common";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useFormikContext } from "formik";
import BaseInteraction, { InteractionValues } from "./BaseInteraction";

interface Props {
  pool: FormattedIndexPool;
}

export default function SwapInteraction({ pool }: Props) {
  const dispatch = useDispatch();
  const handleApprove = useCallback(
    (spender: string, fromToken: string, fromAmount: string) =>
      dispatch(
        actions.approveSpender(
          spender,
          fromToken.toLowerCase(),
          fromAmount.toString()
        )
      ),
    [dispatch]
  );

  return (
    <BaseInteraction
      title="Swap"
      pool={pool}
      onSubmit={console.log}
      extra={<SwapExtras pool={pool} />}
      approvalSelector={selectors.selectApprovalStatus}
      handleApprove={handleApprove}
    />
  );
}

function SwapExtras({ pool }: Props) {
  const { values } = useFormikContext<InteractionValues>();
  const { fromToken, toToken, toAmount } = values;
  const swapCost = getSwapCost(toAmount, pool.swapFee);

  return fromToken && toToken ? (
    <>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <TokenExchangeRate
          baseline={fromToken}
          comparison={toToken}
          rate=""
          fee={swapCost}
        />
        <PlainLanguageTransaction />
      </Space>
      <Divider />
    </>
  ) : null;
}
