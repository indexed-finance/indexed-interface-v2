import { AppState } from "features/store";
import { NDX_ADDRESS } from "config";
import { RegisteredCall } from "helpers";
import { USER_CALLER, selectors } from "./slice";
import { useSelector } from "react-redux";
import useCallRegistrar from "hooks/use-call-registrar";

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
export const useNdxBalance = () => useSelector(selectors.selectNdxBalance);

export function useUserDataRegistrar(
  spender: string,
  tokenIds: string[],
  actions: Record<string, any>,
  selectors: Record<string, any>
) {
  const userAddress = useUserAddress();
  const interfaceKind = "IERC20_ABI";
  const userDataCalls = tokenIds.reduce((prev, next) => {
    prev.push(
      {
        interfaceKind,
        target: next,
        function: "allowance",
        args: [userAddress, spender],
      },
      {
        interfaceKind,
        target: next,
        function: "balanceOf",
        args: [userAddress],
      }
    );

    return prev;
  }, [] as RegisteredCall[]);

  userDataCalls.push({
    interfaceKind,
    target: NDX_ADDRESS,
    function: "balanceOf",
    args: [userAddress],
  });

  useCallRegistrar(
    {
      caller: USER_CALLER,
      onChainCalls: userDataCalls,
    },
    actions,
    selectors
  );
}
