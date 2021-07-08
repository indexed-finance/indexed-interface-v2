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
