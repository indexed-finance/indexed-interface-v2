import { AppState, selectors } from "features";
import { useSelector } from "react-redux";

export function useAllVaults() {
  const vaults = useSelector(selectors.selectAllFormattedVaults);

  return vaults;
}

export function useVault(id: string) {
  const vault = useSelector((state: AppState) =>
    selectors.selectFormattedVault(state, id)
  );

  return vault;
}

export function useVaultDeposit(id: string) {
  // Pass
}

export function useVaultWithdrawal(id: string) {
  // Pass
}

export function useVaultUserBalance(id: string) {
  // Pass
  // Returns { balance: _, value: _ }
}

export function useVaultTvl(id: string) {
  const vault = useVault(id);

  if (vault) {
    return vault.totalValueLocked;
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
