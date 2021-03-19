import { AppState } from "features";
import { selectTokenSupplies } from "features/tokens/slice";
import { useSelector } from "react-redux";
import { useTotalSuppliesListener } from "features/batcher/hooks";
import React from "react";

export function useTotalSuppliesWithLoadingIndicator(
  tokens: string[]
): [string[], false] | [undefined, true] {
  useTotalSuppliesListener(tokens);
  const supplies = useSelector((state: AppState) => selectTokenSupplies(state, tokens));
  if (supplies.some(s => !s)) {
    return [undefined, true];
  }
  return [supplies as string[], false];
}