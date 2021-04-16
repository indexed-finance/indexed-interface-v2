import { NDX_ADDRESS } from "config";
import { RegisteredCall } from "helpers";
import { selectors } from "features";
import { useCallRegistrar } from "./use-call-registrar";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { AppState } from "features/store";

export const useTranslator = () => useSelector(selectors.selectTranslator);

export const useTokenBalances = (tokenIds: string[]) => {
  useBalancesRegistrar(tokenIds);
  return useSelector((state: AppState) => selectors.selectTokenBalances(state, tokenIds));
}

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

export const USER_CALLER = "User";

export function useUserDataRegistrar(poolTokens: Record<string, string[]>) {
  const userAddress = useUserAddress();
  const interfaceKind = "IERC20_ABI";
  const userDataCalls: RegisteredCall[] = userAddress
    ? Object.entries(poolTokens).flatMap(([pool, tokens]) =>
        tokens.flatMap((token) => [
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
        ])
      )
    : [];

  if (userAddress) {
    userDataCalls.push({
      interfaceKind,
      target: NDX_ADDRESS,
      function: "balanceOf",
      args: [userAddress],
    });
  }

  useCallRegistrar({
    caller: USER_CALLER,
    onChainCalls: userDataCalls,
  });
}

export function useBalanceAndApprovalRegistrar(spender: string, _tokens: string | string[]) {
  const tokens = Array.isArray(_tokens) ? _tokens : [_tokens];
  const userAddress = useUserAddress();
  const interfaceKind = "IERC20_ABI";
  const userDataCalls: RegisteredCall[] = userAddress
    ? tokens.reduce((calls, token) => ([
      ...calls,
      {
        interfaceKind,
        target: token.toLowerCase(),
        function: "allowance",
        args: [userAddress.toLowerCase(), spender.toLowerCase()],
      },
      {
        interfaceKind,
        target: token.toLowerCase(),
        function: "balanceOf",
        args: [userAddress.toLowerCase()],
      },
    ]), [] as RegisteredCall[])
    : [];

  if (userAddress) {
    userDataCalls.push({
      interfaceKind,
      target: NDX_ADDRESS,
      function: "balanceOf",
      args: [userAddress],
    });
  }

  useCallRegistrar({
    caller: USER_CALLER,
    onChainCalls: userDataCalls,
  });
}

export function useBalancesRegistrar(tokenIds: string[]) {
  const userAddress = useUserAddress();
  const interfaceKind = "IERC20_ABI";
  const userDataCalls: RegisteredCall[] = useMemo(() => {
    return userAddress ? tokenIds.map(
      (tokenId) => ({
        interfaceKind,
        target: tokenId,
        function: "balanceOf",
        args: [userAddress],
      })
    ): [];
  }, [userAddress, tokenIds]);

  useCallRegistrar({
    caller: USER_CALLER,
    onChainCalls: userDataCalls,
  });
}