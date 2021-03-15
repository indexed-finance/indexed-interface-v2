import {
  AppState,
  actions,
  selectors,
} from "features";
import { ApprovalStatus } from "features/user/slice";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

interface TokenApprovalOptions {
  spender: string;
  tokenId: string;
  amount: string;
}

type TokenApprovalHook = {
  status: ApprovalStatus;
  approve: () => void;
};

export default function useTokenApproval({
  spender,
  tokenId,
  amount,
}: TokenApprovalOptions): TokenApprovalHook {
  const dispatch = useDispatch();
  const status = useSelector((state: AppState) =>
    selectors.selectApprovalStatus(
      state,
      spender.toLowerCase(),
      tokenId,
      amount
    )
  );
  const approve = useCallback(() => {
    if (spender && status === "approval needed") {
      dispatch(
        actions.approveSpender(spender, tokenId, amount)
      );
    }
  }, [dispatch, status, tokenId, spender, amount]);

  return {
    status,
    approve,
  };
}