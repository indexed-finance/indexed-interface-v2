import { NDX_ADDRESS } from "config";
import { RegisteredCall } from "helpers";
import { USER_CALLER, userSelectors } from "./slice";
import { useCallRegistrar } from "hooks";
import { useSelector } from "react-redux";
import type { AppState } from "features/store";

export const useApprovalStatus = (
  tokenId: string,
  spender: string,
  amount: string
) =>
  useSelector((state: AppState) =>
    userSelectors.selectApprovalStatus(state, spender, tokenId, amount)
  );

export const useTokenBalance = (tokenId: string) =>
  useSelector((state: AppState) =>
    userSelectors.selectTokenBalance(state, tokenId)
  );

export const useTokenAllowance = (tokenId: string, spender: string) =>
  useSelector((state: AppState) =>
    userSelectors.selectTokenAllowance(state, spender, tokenId)
  );

export const useUserAddress = () =>
  useSelector(userSelectors.selectUserAddress);
export const useNdxBalance = () => useSelector(userSelectors.selectNdxBalance);

export function useUserDataRegistrar(
  poolTokens: Record<string, string[]>,
  actions: Record<string, any>,
  userSelectors: Record<string, any>
) {
  const userAddress = useUserAddress();
  const interfaceKind = "IERC20_ABI";
  const userDataCalls: RegisteredCall[] = Object.entries(poolTokens).flatMap(
    ([pool, tokens]) => {
      return tokens.flatMap((token) => [
        {
          interfaceKind,
          target: token,
          function: "allowance",
          args: [userAddress, pool],
        },
        {
          interfaceKind,
          target: token,
          function: "balanceOf",
          args: [userAddress],
        },
      ]);
    }
  );

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
    userSelectors
  );
}
