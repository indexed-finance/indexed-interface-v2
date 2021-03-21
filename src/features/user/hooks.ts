import { AppState } from "features/store";
import { selectors } from "./slice";
import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import type { RegisteredCall } from "features";

export const useApprovalStatus = (
  tokenId: string,
  spender: string,
  amount: string
) =>
  useSelector((state: AppState) =>
    selectors.selectApprovalStatus(state, spender, tokenId, amount)
  );

export const useTokenBalance = (tokenId: string) =>
  useSelector((state: AppState) =>
    selectors.selectTokenBalance(state, tokenId)
  );

export const useTokenAllowance = (tokenId: string, spender: string) =>
  useSelector((state: AppState) =>
    selectors.selectTokenAllowance(state, spender, tokenId)
  );

export const useUserAddress = () => useSelector(selectors.selectUserAddress);

export function useUserDataRegistrar(spender: string, tokenIds: string[]) {
  const userAddress = useUserAddress();
  const userDataCalls = tokenIds.reduce((prev, next) => {
    prev.push(
      {
        target: next,
        function: "allowance",
        args: [userAddress, spender],
      },
      {
        target: next,
        function: "balanceOf",
        args: [userAddress],
      }
    );

    return prev;
  }, [] as RegisteredCall[]);

  useCallRegistrar({
    calls: userDataCalls,
  });
}
