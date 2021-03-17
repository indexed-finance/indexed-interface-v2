import { AppState } from "features/store";
import { selectors } from "./slice";
import { useSelector } from "react-redux";

export const useApprovalStatus = (
  tokenId: string, spender: string, amount: string
) => useSelector(
  (state: AppState) => selectors.selectApprovalStatus(state, spender, tokenId, amount)
);

export const useTokenBalance = (tokenId: string) => useSelector(
  (state: AppState) => selectors.selectTokenBalance(state, tokenId)
);

export const useTokenAllowance = (tokenId: string, spender: string) => useSelector(
  (state: AppState) => selectors.selectTokenAllowance(state, spender, tokenId)
);

export const useUserAddress = () => useSelector(selectors.selectUserAddress);