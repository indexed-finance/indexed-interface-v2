import { AppState, actions, selectors, useTotalSuppliesRegistrar } from "features";
import { selectTokenSupplies } from "features/tokens/slice";
import { useSelector } from "react-redux";
// import { useTotalSuppliesListener } from "features/batcher/hooks";

export function useTotalSuppliesWithLoadingIndicator(
  tokens: string[]
): [string[], false] | [undefined, true] {
  useTotalSuppliesRegistrar(tokens, actions, selectors);

  const supplies = useSelector((state: AppState) =>
    selectTokenSupplies(state, tokens)
  );

  if (supplies.some((s) => !s)) {
    return [undefined, true];
  }
  return [supplies as string[], false];
}
