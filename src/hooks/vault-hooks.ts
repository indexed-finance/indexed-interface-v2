import {
  AppState,
  NormalizedTokenAdapter,
  NormalizedVault,
  VAULTS_CALLER,
  selectors,
} from "features";
import { BigNumber, RegisteredCall, convert } from "helpers";
import {
  useBalancesAndApprovalsRegistrar,
  useTokenBalance,
  useTokenBalances,
} from "./user-hooks";
import { useCachedValue } from "./use-debounce";
import { useCallRegistrar } from "./use-call-registrar";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTokenPrices, useTokenPricesLessStrict } from "./token-hooks";

export interface FormattedVault extends NormalizedVault {
  underlyingPrice?: number;
  usdValue?: string;
}

export function useVaultsCount(): number {
  const vaults = useSelector(selectors.selectAllVaults);
  return vaults.length;
}

export function useAllVaults(): FormattedVault[] {
  const vaults = useSelector(selectors.selectAprSortedVaults);
  const underlyings = vaults.map((v) => v.underlying.id);
  const prices = useTokenPricesLessStrict(underlyings);
  return useMemo(() => {
    return vaults.map((vault, i): FormattedVault => {
      const price = prices[i];
      const balance = convert.toBalanceNumber(
        vault.totalValue ?? "0",
        vault.decimals
      );
      return {
        ...vault,
        underlyingPrice: price,
        usdValue: convert.toComma(+(balance * price).toFixed(2)),
      };
    });
  }, [vaults, prices]);
}

export function useVaultAPR(id: string) {
  return useSelector((state: AppState) => selectors.selectVaultAPR(state, id));
}

export function useVaultAdapterAPRs(
  id: string
): { name: string; apr: number; baseAPR: number }[] {
  const vault = useVault(id);
  const reserveRatio = vault?.reserveRatio ?? 0;
  const getNameAndAPR = (adapter: NormalizedTokenAdapter, weight: number) => {
    const name = adapter.protocol.name;
    let apr = 0;
    let baseAPR = 0;
    if (adapter.revenueAPRs) {
      baseAPR = adapter.revenueAPRs.reduce(
        (t, n) => t + convert.toBalanceNumber(n),
        0
      );
      apr = baseAPR * weight * (1 - reserveRatio);
    }
    return { name, apr, baseAPR };
  };
  return (
    vault?.adapters.reduce(
      (prev, next, i) => [...prev, getNameAndAPR(next, vault.weights[i])],
      [] as { name: string; apr: number; baseAPR: number }[]
    ) ?? []
  );
}

export function useVault(id: string): FormattedVault | null {
  const vault = useSelector((state: AppState) =>
    selectors.selectVault(state, id)
  );
  const tokenIds = useMemo(() => vault ? [vault.underlying.id] : [], [vault]);
  const cachedIds = useCachedValue(tokenIds)
  const [prices, loading] = useTokenPrices(cachedIds);

  return useMemo(() => {
    if (loading || !vault) return vault;

    const price = (prices as number[])[0];
    const balance = convert.toBalanceNumber(
      vault.totalValue ?? "0",
      vault.decimals
    );
    return {
      ...vault,
      underlyingPrice: price,
      usdValue: convert.toComma(+(balance * price).toFixed(2)),
    };
  }, [vault, prices, loading]);
}

export function useAllVaultsUserBalance(): Record<string, VaultBalanceEntries> {
  const vaults = useAllVaults();
  const lookup = useSelector((state: AppState) =>
    selectors.selectVaultLookup(state)
  );
  const vaultIds = vaults.map((vault) => vault.id);
  const vaultUnderlyingIds = vaults.map((vault) => vault.underlying.id);
  const vaultTokenBalances = useTokenBalances(vaultIds);
  const vaultUnderlyingBalances = useTokenBalances(vaultUnderlyingIds);
  const vaultUnderlyingPrices = useTokenPricesLessStrict(vaultUnderlyingIds);

  useBalancesAndApprovalsRegistrar(vaultIds, vaultUnderlyingIds);

  return vaultIds
    .map((vaultId, index) => {
      const vault = lookup[vaultId];

      if (vault) {
        const underlyingBalance = convert.toBigNumber(
          vaultUnderlyingBalances[index]
        );
        const wrappedBalance = convert.toBigNumber(vaultTokenBalances[index]);
        const unwrappedBalance = wrappedBalance
          .times(convert.toBigNumber(vault.price ?? "0"))
          .div(convert.toToken("1", 18));
        const usdValue = convert.toBalance(
          unwrappedBalance.times(vaultUnderlyingPrices![index] ?? 0),
          vault.decimals,
          true,
          2
        );

        return {
          id: vaultId,
          balance: {
            exact: underlyingBalance,
            displayed: convert.toBalance(
              underlyingBalance,
              vault.underlying.decimals,
              false,
              10
            ),
          },
          wrappedBalance: {
            exact: wrappedBalance,
            displayed: convert.toBalance(
              wrappedBalance,
              vault.underlying.decimals,
              false,
              10
            ),
          },
          unwrappedBalance: {
            exact: unwrappedBalance,
            displayed: convert.toBalance(
              unwrappedBalance,
              vault.underlying.decimals,
              false,
              10
            ),
          },
          usdValue,
        };
      } else {
        return null;
      }
    })
    .filter(Boolean)
    .reduce((prev, next) => {
      if (next) {
        prev[next.id] = next;
      }

      return prev;
    }, {} as Record<string, VaultBalanceEntries>);
}

export function useVaultUserBalance(id: string) {
  const balances = useAllVaultsUserBalance();

  return balances[id];
}

export function useVaultPortfolioTotalValue() {
  const userBalances = useAllVaultsUserBalance();

  return Object.values(userBalances).reduce((prev, next) => {
    prev += parseFloat(next.usdValue.replace(/,/g, ""));

    return prev;
  }, 0);
}

export function useVaultInterestForUser(id: string) {
  const vault = useVault(id);
  const userBalance = useTokenBalance(id);
  return useMemo(() => {
    if (!vault || !userBalance || !vault.averagePricePerShare) return 0;
    const currentPrice = convert.toBalanceNumber(vault.price ?? "0", 18, 10);
    const formattedBalance = convert.toBalanceNumber(
      userBalance,
      vault.decimals,
      10
    );
    const currentValue = formattedBalance * currentPrice;
    const paidValue = formattedBalance * vault.averagePricePerShare;
    return currentValue - paidValue;
  }, [vault, userBalance]);
}

export function useVaultTvl(id: string) {
  const vault = useVault(id);

  if (vault) {
    // return vault.;
    return "";
  } else {
    return null;
  }
}

export function useVaultTokens(id: string) {
  const vault = useVault(id);

  if (vault) {
    // vault.adapters
  } else {
    return null;
  }
}

export function createVaultCalls(
  id: string,
  adapterIds: string[],
  underlying: string
) {
  const target = id;
  const interfaceKind = "NirnVault";
  const baseCalls: RegisteredCall[] = [
    {
      interfaceKind,
      target,
      function: "balance",
    },
    {
      interfaceKind,
      target,
      function: "getPricePerFullShareWithFee",
    },
    {
      interfaceKind: "IERC20",
      target,
      function: "totalSupply",
    },
    {
      interfaceKind,
      target,
      function: "getBalances",
    },
    {
      interfaceKind,
      target,
      function: "reserveBalance",
    },
  ];
  const adapterCalls = adapterIds.reduce((prev, next) => {
    prev.push({
      interfaceKind: "Erc20Adapter",
      target: next,
      function: "getRevenueBreakdown",
    });

    prev.push();

    return prev;
  }, [] as RegisteredCall[]);

  // TheGraph calls go here as off-chain calls.
  return {
    onChainCalls: [...baseCalls, ...adapterCalls],
    offChainCalls: [
      {
        target: "",
        function: "fetchTokenPriceData",
        args: [underlying],
        canBeMerged: true,
      },
      {
        target: "",
        function: "fetchVaultsData",
        args: [],
        canBeMerged: true,
      },
    ],
  };
}

export function useVaultRegistrar(id: string) {
  const vault = useVault(id);
  const caller = VAULTS_CALLER;
  const { onChainCalls, offChainCalls } = useMemo(
    () =>
      id
        ? createVaultCalls(
            id,
            vault!.adapters.map((each) => each.id),
            vault?.underlying.id ?? ""
          )
        : {
            onChainCalls: [],
            offChainCalls: [],
          },
    [id, vault]
  );

  useCallRegistrar({
    caller,
    onChainCalls,
    offChainCalls,
  });
}

export function useAllVaultsRegistrar() {
  const vaults = useAllVaults();
  const caller = VAULTS_CALLER;
  const { onChainCalls, offChainCalls } = useMemo(
    () =>
      vaults.reduce(
        (prev, next) => {
          const { onChainCalls, offChainCalls } = createVaultCalls(
            next.id,
            next.adapters.map((a) => a.id),
            next.underlying.id ?? ""
          );
          prev.onChainCalls.push(...onChainCalls);
          prev.offChainCalls.push(...offChainCalls);
          return prev;
        },
        {
          onChainCalls: [] as RegisteredCall[],
          offChainCalls: [] as RegisteredCall[],
        }
      ),
    [vaults]
  );

  useCallRegistrar({
    caller,
    onChainCalls,
    offChainCalls,
  });
}

// Types

type BalanceEntry = {
  exact: BigNumber;
  displayed: string;
};

type VaultBalanceEntries = {
  id: string;
  balance: BalanceEntry;
  wrappedBalance: BalanceEntry;
  unwrappedBalance: BalanceEntry;
  usdValue: string;
};
