import {
  AppState,
  actions,
  selectors,
  useTotalSuppliesRegistrar,
} from "features";
import { useSelector } from "react-redux";

export function useTotalSuppliesWithLoadingIndicator(
  tokens: string[]
): [string[], false] | [undefined, true] {
  useTotalSuppliesRegistrar(tokens, actions, selectors);

  const supplies = useSelector((state: AppState) =>
    selectors.selectTokenSupplies(state, tokens)
  );

  if (supplies.some((s) => !s)) {
    return [undefined, true];
  }
  return [supplies as string[], false];
}
